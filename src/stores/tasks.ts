import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { tasksApi } from '@/api'
import { getErrorMessage } from '@/utils/errors'
import type { CreateTaskPayload, Task, TaskLayoutUpdate, TaskStatus, UpdateTaskPayload } from '@/types'

export type { TaskLayoutUpdate }

function applyUpdatesToTasks(tasks: Task[], updates: TaskLayoutUpdate[]): Task[] {
  const updatedMap = new Map(updates.map((update) => [update.id, update]))
  return tasks.map((task) => {
    const update = updatedMap.get(task.id)
    if (!update) return task
    return { ...task, order: update.order, status: update.status }
  })
}

function getChangedUpdates(tasks: Task[], updates: TaskLayoutUpdate[]): TaskLayoutUpdate[] {
  return updates.filter((update) => {
    const task = tasks.find((item) => item.id === update.id)
    return task && (task.order !== update.order || task.status !== update.status)
  })
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentProjectId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const tasksByCurrentProject = computed(() => {
    if (currentProjectId.value === null) return []
    return tasks.value
      .filter((task) => task.projectId === currentProjectId.value)
      .sort((left, right) => left.order - right.order)
  })

  async function fetchTasks(projectId: number): Promise<void> {
    loading.value = true
    error.value = null
    currentProjectId.value = projectId
    try {
      const fetched = await tasksApi.getByProject(projectId)
      tasks.value = [
        ...tasks.value.filter((task) => task.projectId !== projectId),
        ...fetched,
      ]
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load tasks')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: CreateTaskPayload): Promise<Task> {
    error.value = null
    try {
      const task = await tasksApi.create(payload)
      tasks.value = [...tasks.value, task]
      return task
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to create task')
      throw err
    }
  }

  async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    error.value = null
    try {
      const updated = await tasksApi.update(id, payload)
      tasks.value = tasks.value.map((task) => (task.id === id ? updated : task))
      return updated
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to update task')
      throw err
    }
  }

  async function deleteTask(id: number): Promise<void> {
    error.value = null
    try {
      await tasksApi.remove(id)
      tasks.value = tasks.value.filter((item) => item.id !== id)
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to delete task')
      throw err
    }
  }

  async function reorderTasks(
    updates: Array<{ id: number; order: number }>,
  ): Promise<void> {
    const layoutUpdates: TaskLayoutUpdate[] = updates.map((update) => {
      const task = tasks.value.find((item) => item.id === update.id)
      if (!task) {
        throw new Error(`Task ${update.id} not found`)
      }
      return { id: update.id, order: update.order, status: task.status }
    })

    await applyLayout(layoutUpdates)
  }

  async function applyLayout(updates: TaskLayoutUpdate[]): Promise<void> {
    error.value = null

    const changed = getChangedUpdates(tasks.value, updates)
    if (changed.length === 0) return

    const snapshot = [...tasks.value]
    tasks.value = applyUpdatesToTasks(tasks.value, changed)

    try {
      const results = await tasksApi.batchUpdate(changed)
      const resultMap = new Map(results.map((task) => [task.id, task]))
      tasks.value = tasks.value.map((task) => resultMap.get(task.id) ?? task)
    } catch (err) {
      tasks.value = snapshot
      error.value = getErrorMessage(err, 'Failed to update tasks')
      throw err
    }
  }

  function getTasksByProject(projectId: number): Task[] {
    return tasks.value
      .filter((task) => task.projectId === projectId)
      .sort((left, right) => left.order - right.order)
  }

  function getTasksByStatus(projectId: number, status: TaskStatus): Task[] {
    return getTasksByProject(projectId).filter((task) => task.status === status)
  }

  function getTaskById(id: number): Task | undefined {
    return tasks.value.find((task) => task.id === id)
  }

  function removeProjectTasks(projectId: number): void {
    tasks.value = tasks.value.filter((task) => task.projectId !== projectId)
    if (currentProjectId.value === projectId) {
      currentProjectId.value = null
    }
  }

  return {
    tasks,
    currentProjectId,
    loading,
    error,
    tasksByCurrentProject,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    applyLayout,
    getTasksByProject,
    getTasksByStatus,
    getTaskById,
    removeProjectTasks,
  }
})
