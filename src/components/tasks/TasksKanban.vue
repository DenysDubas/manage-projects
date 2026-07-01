<script setup lang="ts">
import { toRef } from 'vue'
import draggable from 'vuedraggable'
import KanbanCard from '@/components/tasks/KanbanCard.vue'
import { KANBAN_COLUMNS, useKanbanBoard } from '@/composables/useKanbanBoard'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{
  projectId: number
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
}>()

const { columnTasks, schedulePersist } = useKanbanBoard(toRef(props, 'projectId'))

function onColumnModelUpdate(status: TaskStatus, tasks: Task[]): void {
  columnTasks.value[status] = tasks
}

function onDragEnd(): void {
  schedulePersist()
}
</script>

<template>
  <div class="kanban-board">
    <div v-for="column in KANBAN_COLUMNS" :key="column.status" class="kanban-column">
      <header class="kanban-column__header">
        <span>{{ column.label }}</span>
        <span class="kanban-column__count">{{ columnTasks[column.status].length }}</span>
      </header>
      <draggable
        :model-value="columnTasks[column.status]"
        class="kanban-column__list"
        item-key="id"
        group="tasks"
        animation="200"
        ghost-class="kanban-ghost"
        @update:model-value="onColumnModelUpdate(column.status, $event)"
        @end="onDragEnd"
      >
        <template #item="{ element: task }">
          <KanbanCard
            :task="task"
            @edit="emit('edit', task)"
            @delete="emit('delete', task)"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped lang="scss">
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 1rem;
  align-items: start;
}

.kanban-column {
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  min-height: 420px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid $color-border;
  }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.375rem;
    border-radius: 999px;
    background: $color-surface;
    font-size: 0.75rem;
    color: $color-muted;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 360px;
    padding: 0.75rem;
  }
}

.kanban-ghost {
  opacity: 0.5;
}

@media (max-width: 960px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
