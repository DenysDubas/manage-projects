import type { Project, Task } from '@/types'

const STORAGE_KEYS = {
  projects: 'pm_projects',
  tasks: 'pm_tasks',
  initialized: 'pm_initialized',
} as const

function seedData(): { projects: Project[]; tasks: Task[] } {
  const projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Corporate website overhaul',
      status: 'active',
      createdAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 2,
      name: 'Mobile App MVP',
      description: 'First release of the mobile application',
      status: 'active',
      createdAt: '2025-02-20T14:30:00.000Z',
    },
    {
      id: 3,
      name: 'Legacy Migration',
      description: 'Migrate old monolith to microservices',
      status: 'archived',
      createdAt: '2024-11-05T09:00:00.000Z',
    },
  ]

  const tasks: Task[] = [
    {
      id: 1,
      projectId: 1,
      name: 'Design homepage mockups',
      assignee: 'Alice',
      status: 'done',
      deadline: '2025-02-01',
      order: 0,
    },
    {
      id: 2,
      projectId: 1,
      name: 'Implement responsive layout',
      assignee: 'Bob',
      status: 'in_progress',
      deadline: '2025-03-15',
      order: 1,
    },
    {
      id: 3,
      projectId: 1,
      name: 'SEO optimization',
      assignee: null,
      status: 'todo',
      deadline: '2025-04-01',
      order: 2,
    },
    {
      id: 4,
      projectId: 2,
      name: 'Setup CI/CD pipeline',
      assignee: 'Charlie',
      status: 'in_progress',
      deadline: '2025-03-20',
      order: 0,
    },
    {
      id: 5,
      projectId: 2,
      name: 'User authentication flow',
      assignee: 'Alice',
      status: 'todo',
      deadline: '2025-04-10',
      order: 1,
    },
  ]

  return { projects, tasks }
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureStorageInitialized(): void {
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return
  const { projects, tasks } = seedData()
  writeJson(STORAGE_KEYS.projects, projects)
  writeJson(STORAGE_KEYS.tasks, tasks)
  localStorage.setItem(STORAGE_KEYS.initialized, 'true')
}

export function getProjectsFromStorage(): Project[] {
  ensureStorageInitialized()
  return readJson<Project[]>(STORAGE_KEYS.projects, [])
}

export function saveProjectsToStorage(projects: Project[]): void {
  writeJson(STORAGE_KEYS.projects, projects)
}

export function getTasksFromStorage(): Task[] {
  ensureStorageInitialized()
  return readJson<Task[]>(STORAGE_KEYS.tasks, [])
}

export function saveTasksToStorage(tasks: Task[]): void {
  writeJson(STORAGE_KEYS.tasks, tasks)
}

export function getNextId(items: { id: number }[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map((item) => item.id)) + 1
}
