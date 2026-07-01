import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types'

export function useTaskDrag() {
  const tasksStore = useTasksStore()

  async function reorderInTable(tasks: Task[]): Promise<void> {
    await tasksStore.reorderTasks(
      tasks.map((task, index) => ({
        id: task.id,
        order: index,
      })),
    )
  }

  return {
    reorderInTable,
  }
}
