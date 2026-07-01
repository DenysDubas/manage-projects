import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  getNextId,
  getProjectsFromStorage,
  getTasksFromStorage,
  saveProjectsToStorage,
  saveTasksToStorage,
} from '@/api/storage'
import type {
  CreateProjectPayload,
  CreateTaskPayload,
  Project,
  ProjectWithTaskCount,
  Task,
  TaskBatchUpdatePayload,
  UpdateProjectPayload,
  UpdateTaskPayload,
} from '@/types'

function randomDelay(): Promise<void> {
  const ms = 150 + Math.random() * 150
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config,
  }
}

function createErrorResponse(
  config: InternalAxiosRequestConfig,
  message: string,
  status: number,
): Promise<never> {
  const error = new Error(message) as Error & {
    response: AxiosResponse<{ message: string }>
    config: InternalAxiosRequestConfig
    isAxiosError: boolean
  }
  error.response = createResponse(config, { message }, status)
  error.config = config
  error.isAxiosError = true
  return Promise.reject(error)
}

function attachTaskCounts(projects: Project[]): ProjectWithTaskCount[] {
  const tasks = getTasksFromStorage()
  return projects.map((project) => ({
    ...project,
    taskCount: tasks.filter((task) => task.projectId === project.id).length,
  }))
}

function parseProjectId(url: string): number | null {
  const match = url.match(/\/projects\/(\d+)/)
  return match ? Number(match[1]) : null
}

function parseTaskId(url: string): number | null {
  const match = url.match(/\/tasks\/(\d+)/)
  return match ? Number(match[1]) : null
}

function parseProjectIdFromQuery(url: string): number | null {
  const query = url.split('?')[1]
  if (!query) return null
  const params = new URLSearchParams(query)
  const projectId = params.get('projectId')
  return projectId ? Number(projectId) : null
}

function resolveProjectId(
  config: InternalAxiosRequestConfig,
  url: string,
): number | null {
  const fromUrl = parseProjectIdFromQuery(url)
  if (fromUrl !== null && !Number.isNaN(fromUrl)) return fromUrl

  const params = config.params as Record<string, unknown> | undefined
  if (params?.projectId === undefined || params.projectId === null) return null

  const projectId = Number(params.projectId)
  return Number.isNaN(projectId) ? null : projectId
}

function parseBody<T>(config: InternalAxiosRequestConfig): T | null {
  try {
    if (typeof config.data === 'string') {
      return JSON.parse(config.data) as T
    }
    return config.data as T
  } catch {
    return null
  }
}

function handleBatchTaskUpdate(
  config: InternalAxiosRequestConfig,
): AxiosResponse<Task[]> | Promise<never> {
  const payload = parseBody<TaskBatchUpdatePayload>(config)
  if (!payload) {
    return createErrorResponse(config, 'Invalid JSON body', 400)
  }

  if (!Array.isArray(payload.updates) || payload.updates.length === 0) {
    return createErrorResponse(config, 'updates array is required', 400)
  }

  const tasks = getTasksFromStorage()
  const results: Task[] = []

  for (const update of payload.updates) {
    const index = tasks.findIndex((task) => task.id === update.id)
    if (index === -1) {
      return createErrorResponse(config, `Task ${update.id} not found`, 404)
    }

    const updated: Task = {
      ...tasks[index],
      order: update.order,
      status: update.status,
    }
    tasks[index] = updated
    results.push(updated)
  }

  saveTasksToStorage(tasks)
  return createResponse(config, results)
}

async function handleGet(
  config: InternalAxiosRequestConfig,
  url: string,
): Promise<AxiosResponse> {
  if (url.startsWith('/projects') && !url.includes('/projects/')) {
    const projects = attachTaskCounts(getProjectsFromStorage())
    return createResponse(config, projects)
  }

  if (url.startsWith('/tasks')) {
    const projectId = resolveProjectId(config, url)
    if (projectId === null) {
      return createErrorResponse(config, 'projectId is required', 400)
    }
    const tasks = getTasksFromStorage()
      .filter((task) => task.projectId === projectId)
      .sort((a, b) => a.order - b.order)
    return createResponse(config, tasks)
  }

  return createErrorResponse(config, 'Not found', 404)
}

async function handlePost(
  config: InternalAxiosRequestConfig,
  url: string,
): Promise<AxiosResponse> {
  if (url === '/projects') {
    const payload = parseBody<CreateProjectPayload>(config)
    if (!payload) return createErrorResponse(config, 'Invalid JSON body', 400)
    const projects = getProjectsFromStorage()
    const project: Project = {
      id: getNextId(projects),
      name: payload.name,
      description: payload.description ?? '',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    saveProjectsToStorage([...projects, project])
    return createResponse(config, { ...project, taskCount: 0 })
  }

  if (url === '/tasks') {
    const payload = parseBody<CreateTaskPayload>(config)
    if (!payload) return createErrorResponse(config, 'Invalid JSON body', 400)
    const tasks = getTasksFromStorage()
    const projectTasks = tasks.filter((task) => task.projectId === payload.projectId)
    const maxOrder = projectTasks.reduce((max, task) => Math.max(max, task.order), -1)
    const task: Task = {
      id: getNextId(tasks),
      projectId: payload.projectId,
      name: payload.name,
      assignee: payload.assignee ?? null,
      status: payload.status,
      deadline: payload.deadline,
      order: maxOrder + 1,
    }
    saveTasksToStorage([...tasks, task])
    return createResponse(config, task)
  }

  return createErrorResponse(config, 'Not found', 404)
}

async function handlePut(
  config: InternalAxiosRequestConfig,
  url: string,
): Promise<AxiosResponse> {
  if (url === '/tasks/reorder') {
    return handleBatchTaskUpdate(config)
  }

  const projectId = parseProjectId(url)
  if (projectId !== null) {
    const projects = getProjectsFromStorage()
    const index = projects.findIndex((project) => project.id === projectId)
    if (index === -1) return createErrorResponse(config, 'Project not found', 404)
    const payload = parseBody<UpdateProjectPayload>(config)
    if (!payload) return createErrorResponse(config, 'Invalid JSON body', 400)
    const updated: Project = { ...projects[index], ...payload }
    projects[index] = updated
    saveProjectsToStorage(projects)
    const tasks = getTasksFromStorage()
    return createResponse(config, {
      ...updated,
      taskCount: tasks.filter((task) => task.projectId === projectId).length,
    })
  }

  const taskId = parseTaskId(url)
  if (taskId !== null) {
    const tasks = getTasksFromStorage()
    const index = tasks.findIndex((task) => task.id === taskId)
    if (index === -1) return createErrorResponse(config, 'Task not found', 404)
    const payload = parseBody<UpdateTaskPayload>(config)
    if (!payload) return createErrorResponse(config, 'Invalid JSON body', 400)
    const updated: Task = { ...tasks[index], ...payload }
    tasks[index] = updated
    saveTasksToStorage(tasks)
    return createResponse(config, updated)
  }

  return createErrorResponse(config, 'Not found', 404)
}

async function handleDelete(
  config: InternalAxiosRequestConfig,
  url: string,
): Promise<AxiosResponse> {
  const projectId = parseProjectId(url)
  if (projectId !== null) {
    const projects = getProjectsFromStorage()
    const exists = projects.some((project) => project.id === projectId)
    if (!exists) return createErrorResponse(config, 'Project not found', 404)
    saveProjectsToStorage(projects.filter((project) => project.id !== projectId))
    const tasks = getTasksFromStorage()
    saveTasksToStorage(tasks.filter((task) => task.projectId !== projectId))
    return createResponse(config, null)
  }

  const taskId = parseTaskId(url)
  if (taskId !== null) {
    const tasks = getTasksFromStorage()
    const exists = tasks.some((task) => task.id === taskId)
    if (!exists) return createErrorResponse(config, 'Task not found', 404)
    saveTasksToStorage(tasks.filter((task) => task.id !== taskId))
    return createResponse(config, null)
  }

  return createErrorResponse(config, 'Not found', 404)
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await randomDelay()

  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''

  switch (method) {
    case 'get':
      return handleGet(config, url)
    case 'post':
      return handlePost(config, url)
    case 'put':
      return handlePut(config, url)
    case 'delete':
      return handleDelete(config, url)
    default:
      return createErrorResponse(config, 'Method not allowed', 405)
  }
}
