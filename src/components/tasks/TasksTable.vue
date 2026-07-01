<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTableSort } from '@/composables/useTableSort'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TableHeader from '@/components/common/TableHeader.vue'
import { formatDate } from '@/utils/date'
import type { Task, TaskStatus } from '@/types'
import { TaskStatus as TaskStatusEnum } from '@/types'

type TaskColumn = 'id' | 'name' | 'assignee' | 'status' | 'deadline'

const props = defineProps<{
  projectId: number
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
}>()

const assigneeFilter = ref('')
const statusFilter = ref<'all' | TaskStatus>('all')

const { reorderInTable } = useTaskDrag()
const { showToast } = useToast()
const { sort, toggleSort, sortItems, getSortIndicator } = useTableSort<TaskColumn>()
const { columnWidths, startResize } = useColumnResize(`tasks-table-widths-${props.projectId}`, {
  id: 70,
  name: 260,
  assignee: 160,
  status: 140,
  deadline: 140,
  actions: 110,
})

const localTasks = ref<Task[]>([])

const hasActiveFilters = computed(
  () => statusFilter.value !== 'all' || assigneeFilter.value.trim() !== '',
)

const isDragDisabled = computed(() => Boolean(sort.value.key) || hasActiveFilters.value)

const filteredTasks = computed(() => {
  let result = props.tasks

  if (statusFilter.value !== 'all') {
    result = result.filter((task) => task.status === statusFilter.value)
  }

  const assignee = assigneeFilter.value.trim().toLowerCase()
  if (assignee) {
    result = result.filter((task) => (task.assignee ?? '').toLowerCase().includes(assignee))
  }

  return sortItems(result, (task, key) => {
    switch (key) {
      case 'id':
        return task.id
      case 'name':
        return task.name
      case 'assignee':
        return task.assignee
      case 'status':
        return task.status
      case 'deadline':
        return task.deadline
      default:
        return null
    }
  })
})

const draggableTasks = computed({
  get: () => (isDragDisabled.value ? filteredTasks.value : localTasks.value),
  set: (value: Task[]) => {
    localTasks.value = value
  },
})

watch(
  () => props.tasks,
  (tasks) => {
    localTasks.value = [...tasks].sort((left, right) => left.order - right.order)
  },
  { immediate: true, deep: true },
)

function resetLocalTasks(): void {
  localTasks.value = [...props.tasks].sort((left, right) => left.order - right.order)
}

async function onDragEnd(): Promise<void> {
  if (isDragDisabled.value) return
  try {
    await reorderInTable(localTasks.value)
  } catch {
    resetLocalTasks()
    showToast('Не вдалося зберегти порядок завдань', 'error')
  }
}

function onResizeStart(column: TaskColumn | 'actions', event: MouseEvent): void {
  startResize(column, event.clientX)
}
</script>

<template>
  <div class="card tasks-table">
    <div class="filters-bar">
      <AppInput
        v-model="assigneeFilter"
        label="Виконавець"
        placeholder="Фільтр за виконавцем..."
      />
      <AppSelect v-model="statusFilter" label="Статус">
        <option value="all">Усі</option>
        <option :value="TaskStatusEnum.TODO">To Do</option>
        <option :value="TaskStatusEnum.IN_PROGRESS">In Progress</option>
        <option :value="TaskStatusEnum.DONE">Done</option>
      </AppSelect>
    </div>

    <p v-if="hasActiveFilters" class="tasks-table__hint">
      Перетягування вимкнено під час активних фільтрів
    </p>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="drag-col" />
            <TableHeader
              label="ID"
              sortable
              :sort-direction="getSortIndicator('id')"
              :width="columnWidths.id"
              @sort="toggleSort('id')"
              @resize-start="onResizeStart('id', $event)"
            />
            <TableHeader
              label="Назва"
              sortable
              :sort-direction="getSortIndicator('name')"
              :width="columnWidths.name"
              @sort="toggleSort('name')"
              @resize-start="onResizeStart('name', $event)"
            />
            <TableHeader
              label="Виконавець"
              sortable
              :sort-direction="getSortIndicator('assignee')"
              :width="columnWidths.assignee"
              @sort="toggleSort('assignee')"
              @resize-start="onResizeStart('assignee', $event)"
            />
            <TableHeader
              label="Статус"
              sortable
              :sort-direction="getSortIndicator('status')"
              :width="columnWidths.status"
              @sort="toggleSort('status')"
              @resize-start="onResizeStart('status', $event)"
            />
            <TableHeader
              label="Дедлайн"
              sortable
              :sort-direction="getSortIndicator('deadline')"
              :width="columnWidths.deadline"
              @sort="toggleSort('deadline')"
              @resize-start="onResizeStart('deadline', $event)"
            />
            <TableHeader label="" :width="columnWidths.actions" />
          </tr>
        </thead>
        <draggable
          v-model="draggableTasks"
          tag="tbody"
          item-key="id"
          handle=".drag-handle"
          :disabled="isDragDisabled"
          animation="200"
          ghost-class="drag-ghost"
          @end="onDragEnd"
        >
          <template #item="{ element: task }">
            <tr class="data-table__row">
              <td class="drag-col">
                <span
                  class="drag-handle"
                  :class="{ 'drag-handle--disabled': isDragDisabled }"
                  title="Перетягнути"
                >
                  ⋮⋮
                </span>
              </td>
              <td :style="{ width: `${columnWidths.id}px` }">{{ task.id }}</td>
              <td :style="{ width: `${columnWidths.name}px` }">{{ task.name }}</td>
              <td :style="{ width: `${columnWidths.assignee}px` }">
                {{ task.assignee ?? '—' }}
              </td>
              <td :style="{ width: `${columnWidths.status}px` }">
                <StatusBadge :status="task.status" />
              </td>
              <td :style="{ width: `${columnWidths.deadline}px` }">
                {{ formatDate(task.deadline) }}
              </td>
              <td :style="{ width: `${columnWidths.actions}px` }" @click.stop>
                <div class="row-actions">
                  <AppButton variant="ghost" title="Редагувати" @click="emit('edit', task)">
                    ✎
                  </AppButton>
                  <AppButton variant="ghost" title="Видалити" @click="emit('delete', task)">
                    🗑
                  </AppButton>
                </div>
              </td>
            </tr>
          </template>
        </draggable>
        <tbody v-if="draggableTasks.length === 0">
          <tr>
            <td colspan="7" class="empty-state">Завдань не знайдено</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/data-table' as *;

.tasks-table__hint {
  margin: 0;
  padding: 0.75rem 1rem 0;
  font-size: 0.8125rem;
  color: $color-muted;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  @include data-table-base;
}

.drag-col {
  width: 40px;
  text-align: center;
}

.drag-handle {
  cursor: grab;
  color: $color-muted;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &--disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.drag-ghost {
  opacity: 0.5;
  background: rgb(37 99 235 / 10%);
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
