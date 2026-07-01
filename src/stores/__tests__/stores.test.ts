import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjectTaskActions } from '@/composables/useProjectTaskActions'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

vi.mock('@/api', () => ({
  projectsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  tasksApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    batchUpdate: vi.fn(),
  },
}))

import { projectsApi, tasksApi } from '@/api'

describe('useProjectTaskActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('deleteProject removes project and clears related tasks from store', async () => {
    vi.mocked(projectsApi.remove).mockResolvedValue(undefined)

    const projectsStore = useProjectsStore()
    const tasksStore = useTasksStore()
    const { deleteProject } = useProjectTaskActions()

    projectsStore.projects = [
      {
        id: 1,
        name: 'A',
        description: '',
        status: 'active',
        createdAt: '2025-01-01',
        taskCount: 2,
      },
      {
        id: 2,
        name: 'B',
        description: '',
        status: 'active',
        createdAt: '2025-01-02',
        taskCount: 1,
      },
    ]

    tasksStore.tasks = [
      {
        id: 10,
        projectId: 1,
        name: 'Task 1',
        assignee: null,
        status: 'todo',
        deadline: '2025-05-01',
        order: 0,
      },
      {
        id: 11,
        projectId: 2,
        name: 'Task 2',
        assignee: null,
        status: 'todo',
        deadline: '2025-05-02',
        order: 0,
      },
    ]

    await deleteProject(1)

    expect(projectsApi.remove).toHaveBeenCalledWith(1)
    expect(projectsStore.projects).toHaveLength(1)
    expect(projectsStore.projects[0].id).toBe(2)
    expect(tasksStore.tasks).toHaveLength(1)
    expect(tasksStore.tasks[0].projectId).toBe(2)
  })

  it('deleteTask updates task count', async () => {
    vi.mocked(tasksApi.remove).mockResolvedValue(undefined)

    const projectsStore = useProjectsStore()
    const tasksStore = useTasksStore()
    const { deleteTask } = useProjectTaskActions()

    projectsStore.projects = [
      {
        id: 1,
        name: 'A',
        description: '',
        status: 'active',
        createdAt: '2025-01-01',
        taskCount: 2,
      },
    ]

    tasksStore.tasks = [
      {
        id: 10,
        projectId: 1,
        name: 'Task 1',
        assignee: null,
        status: 'todo',
        deadline: '2025-05-01',
        order: 0,
      },
      {
        id: 11,
        projectId: 1,
        name: 'Task 2',
        assignee: null,
        status: 'todo',
        deadline: '2025-05-02',
        order: 1,
      },
    ]

    await deleteTask(10)

    expect(tasksApi.remove).toHaveBeenCalledWith(10)
    expect(tasksStore.tasks).toHaveLength(1)
    expect(projectsStore.projects[0].taskCount).toBe(1)
  })

  it('createTask increments task count', async () => {
    const createdTask = {
      id: 12,
      projectId: 1,
      name: 'New Task',
      assignee: null,
      status: 'todo' as const,
      deadline: '2025-06-01',
      order: 2,
    }
    vi.mocked(tasksApi.create).mockResolvedValue(createdTask)

    const projectsStore = useProjectsStore()
    const tasksStore = useTasksStore()
    const { createTask } = useProjectTaskActions()

    projectsStore.projects = [
      {
        id: 1,
        name: 'A',
        description: '',
        status: 'active',
        createdAt: '2025-01-01',
        taskCount: 2,
      },
    ]

    await createTask({
      projectId: 1,
      name: 'New Task',
      status: 'todo',
      deadline: '2025-06-01',
    })

    expect(tasksStore.tasks).toHaveLength(1)
    expect(projectsStore.projects[0].taskCount).toBe(3)
  })
})

describe('tasks store applyLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('rolls back tasks on batch update failure', async () => {
    vi.mocked(tasksApi.batchUpdate).mockRejectedValue(new Error('Network error'))

    const tasksStore = useTasksStore()
    tasksStore.tasks = [
      {
        id: 10,
        projectId: 1,
        name: 'Task 1',
        assignee: null,
        status: 'todo',
        deadline: '2025-05-01',
        order: 0,
      },
    ]

    await expect(
      tasksStore.applyLayout([{ id: 10, order: 1, status: 'in_progress' }]),
    ).rejects.toThrow('Network error')

    expect(tasksStore.tasks[0]).toMatchObject({ order: 0, status: 'todo' })
  })
})
