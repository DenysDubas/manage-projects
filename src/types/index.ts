export const ProjectStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const ViewMode = {
  TABLE: 'table',
  KANBAN: 'kanban',
} as const

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode]

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
}

export interface ProjectWithTaskCount extends Project {
  taskCount: number
}

export interface Task {
  id: number
  projectId: number
  name: string
  assignee: string | null
  status: TaskStatus
  deadline: string
  order: number
}

export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: ProjectStatus
}

export interface CreateTaskPayload {
  projectId: number
  name: string
  assignee?: string | null
  status: TaskStatus
  deadline: string
}

export interface UpdateTaskPayload {
  name?: string
  assignee?: string | null
  status?: TaskStatus
  deadline?: string
  order?: number
}

export interface TaskLayoutUpdate {
  id: number
  order: number
  status: TaskStatus
}

export interface TaskBatchUpdatePayload {
  updates: TaskLayoutUpdate[]
}

export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

export type StatusBadgeValue = ProjectStatus | TaskStatus

export type SortDirection = 'asc' | 'desc'

export interface SortState<T extends string = string> {
  key: T | null
  direction: SortDirection
}
