import { apiDelete, apiGet, apiPost, apiPut } from '@/api/client'
import type {
  CreateProjectPayload,
  CreateTaskPayload,
  ProjectWithTaskCount,
  Task,
  TaskBatchUpdatePayload,
  TaskLayoutUpdate,
  UpdateProjectPayload,
  UpdateTaskPayload,
} from '@/types'

export const projectsApi = {
  getAll: () => apiGet<ProjectWithTaskCount[]>('/projects'),
  create: (payload: CreateProjectPayload) =>
    apiPost<ProjectWithTaskCount, CreateProjectPayload>('/projects', payload),
  update: (id: number, payload: UpdateProjectPayload) =>
    apiPut<ProjectWithTaskCount, UpdateProjectPayload>(`/projects/${id}`, payload),
  remove: (id: number) => apiDelete(`/projects/${id}`),
}

export const tasksApi = {
  getByProject: (projectId: number) =>
    apiGet<Task[]>('/tasks', { projectId }),
  create: (payload: CreateTaskPayload) =>
    apiPost<Task, CreateTaskPayload>('/tasks', payload),
  update: (id: number, payload: UpdateTaskPayload) =>
    apiPut<Task, UpdateTaskPayload>(`/tasks/${id}`, payload),
  remove: (id: number) => apiDelete(`/tasks/${id}`),
  batchUpdate: (updates: TaskLayoutUpdate[]) =>
    apiPut<Task[], TaskBatchUpdatePayload>('/tasks/reorder', { updates }),
}
