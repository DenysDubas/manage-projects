import { computed, ref, watch, type Ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from '@/composables/useToast'
import type { Task, TaskStatus } from '@/types'
import { TaskStatus as TaskStatusEnum } from '@/types'

export const KANBAN_COLUMNS = [
  { status: TaskStatusEnum.TODO, label: '📝 To Do' },
  { status: TaskStatusEnum.IN_PROGRESS, label: '🚧 In Progress' },
  { status: TaskStatusEnum.DONE, label: '✅ Done' },
] as const satisfies ReadonlyArray<{ status: TaskStatus; label: string }>

export function useKanbanBoard(projectId: Ref<number> | number) {
  const tasksStore = useTasksStore()
  const { showToast } = useToast()
  const resolvedProjectId = computed(() =>
    typeof projectId === 'number' ? projectId : projectId.value,
  )

  const columnTasks = ref<Record<TaskStatus, Task[]>>({
    [TaskStatusEnum.TODO]: [],
    [TaskStatusEnum.IN_PROGRESS]: [],
    [TaskStatusEnum.DONE]: [],
  })

  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let isSyncing = false

  function readColumnsFromStore(): Record<TaskStatus, Task[]> {
    const id = resolvedProjectId.value
    return {
      [TaskStatusEnum.TODO]: [...tasksStore.getTasksByStatus(id, TaskStatusEnum.TODO)],
      [TaskStatusEnum.IN_PROGRESS]: [
        ...tasksStore.getTasksByStatus(id, TaskStatusEnum.IN_PROGRESS),
      ],
      [TaskStatusEnum.DONE]: [...tasksStore.getTasksByStatus(id, TaskStatusEnum.DONE)],
    }
  }

  function syncFromStore(): void {
    if (isSyncing) return
    columnTasks.value = readColumnsFromStore()
  }

  watch(
    () => tasksStore.getTasksByProject(resolvedProjectId.value),
    () => syncFromStore(),
    { deep: true },
  )

  watch(resolvedProjectId, () => syncFromStore(), { immediate: true })

  function schedulePersist(): void {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      void persistColumns()
    }, 0)
  }

  async function persistColumns(): Promise<void> {
    isSyncing = true
    try {
      const updates = KANBAN_COLUMNS.flatMap(({ status }) =>
        columnTasks.value[status].map((task, index) => ({
          id: task.id,
          order: index,
          status,
        })),
      )
      await tasksStore.applyLayout(updates)
    } catch {
      showToast('Не вдалося зберегти порядок завдань', 'error')
    } finally {
      isSyncing = false
      columnTasks.value = readColumnsFromStore()
    }
  }

  return {
    columnTasks,
    schedulePersist,
  }
}
