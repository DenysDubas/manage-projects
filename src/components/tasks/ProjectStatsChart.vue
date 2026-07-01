<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { TaskStatus } from '@/types'

const props = defineProps<{
  tasks: Task[]
}>()

const stats = computed(() => {
  const total = props.tasks.length
  const todo = props.tasks.filter((task) => task.status === TaskStatus.TODO).length
  const inProgress = props.tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length
  const done = props.tasks.filter((task) => task.status === TaskStatus.DONE).length

  return [
    { label: 'To Do', value: todo, percent: total ? (todo / total) * 100 : 0, color: '#64748b' },
    {
      label: 'In Progress',
      value: inProgress,
      percent: total ? (inProgress / total) * 100 : 0,
      color: '#d97706',
    },
    { label: 'Done', value: done, percent: total ? (done / total) * 100 : 0, color: '#16a34a' },
  ]
})
</script>

<template>
  <div class="stats-card card">
    <h3 class="stats-card__title">Статистика завдань</h3>
    <div class="stats-card__bars">
      <div v-for="item in stats" :key="item.label" class="stats-row">
        <div class="stats-row__header">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
        <div class="stats-row__track">
          <div
            class="stats-row__fill"
            :style="{ width: `${item.percent}%`, backgroundColor: item.color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-card {
  padding: 1rem;
  margin-bottom: 1rem;

  &__title {
    margin: 0 0 1rem;
    font-size: 1rem;
  }

  &__bars {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
}

.stats-row {
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.375rem;
    font-size: 0.875rem;
  }

  &__track {
    height: 8px;
    background: $color-bg;
    border-radius: 999px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }
}
</style>
