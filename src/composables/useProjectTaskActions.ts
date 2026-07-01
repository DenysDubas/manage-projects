import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import type { CreateTaskPayload, Task } from '@/types'

/**
 * Orchestrates cross-store operations without circular Pinia dependencies.
 * Views and modals should use this for actions that affect both projects and tasks.
 */
export function useProjectTaskActions() {
  const projectsStore = useProjectsStore()
  const tasksStore = useTasksStore()

  async function deleteProject(id: number): Promise<void> {
    await projectsStore.deleteProject(id)
    tasksStore.removeProjectTasks(id)
  }

  async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const task = await tasksStore.createTask(payload)
    projectsStore.refreshTaskCount(payload.projectId, 1)
    return task
  }

  async function deleteTask(id: number): Promise<void> {
    const task = tasksStore.getTaskById(id)
    await tasksStore.deleteTask(id)
    if (task) {
      projectsStore.refreshTaskCount(task.projectId, -1)
    }
  }

  return {
    deleteProject,
    createTask,
    deleteTask,
  }
}
