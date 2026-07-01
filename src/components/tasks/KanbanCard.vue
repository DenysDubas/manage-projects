<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue'
import { formatDate } from '@/utils/date'
import type { Task } from '@/types'

defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
}>()
</script>

<template>
  <article class="kanban-card" :data-task-id="task.id">
    <div class="kanban-card__header">
      <h3 class="kanban-card__title">{{ task.name }}</h3>
      <div class="kanban-card__actions">
        <AppButton variant="ghost" title="Редагувати" @click.stop="emit('edit', task)">
          ✎
        </AppButton>
        <AppButton variant="ghost" title="Видалити" @click.stop="emit('delete', task)">
          🗑
        </AppButton>
      </div>
    </div>
    <p class="kanban-card__meta">
      <span>{{ task.assignee ?? 'Без виконавця' }}</span>
      <span>{{ formatDate(task.deadline) }}</span>
    </p>
  </article>
</template>

<style scoped lang="scss">
.kanban-card {
  padding: 0.875rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  cursor: grab;
  transition: transform $transition, box-shadow $transition;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &:active {
    cursor: grabbing;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.125rem;
    flex-shrink: 0;
  }

  &__title {
    margin: 0;
    font-size: 0.9375rem;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.75rem;
    color: $color-muted;
  }
}
</style>
