<script setup lang="ts">
import { computed } from 'vue'
import type { StatusBadgeValue } from '@/types'

const props = defineProps<{
  status: StatusBadgeValue
}>()

const label = computed(() => {
  const map: Record<StatusBadgeValue, string> = {
    active: 'Active',
    archived: 'Archived',
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  }
  return map[props.status]
})
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  &--active {
    background: rgb(37 99 235 / 12%);
    color: $color-primary;
  }

  &--archived {
    background: rgb(100 116 139 / 15%);
    color: $color-muted;
  }

  &--todo {
    background: rgb(100 116 139 / 15%);
    color: $color-muted;
  }

  &--in_progress {
    background: rgb(217 119 6 / 15%);
    color: $color-warning;
  }

  &--done {
    background: rgb(22 163 74 / 15%);
    color: $color-success;
  }
}
</style>
