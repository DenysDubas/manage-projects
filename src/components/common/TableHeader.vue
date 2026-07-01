<script setup lang="ts">
import type { SortDirection } from '@/types'

defineProps<{
  label: string
  sortable?: boolean
  sortDirection?: SortDirection | null
  width?: number
}>()

const emit = defineEmits<{
  sort: []
  resizeStart: [event: MouseEvent]
}>()
</script>

<template>
  <th class="table-header" :style="{ width: width ? `${width}px` : undefined }">
    <button
      class="table-header__button"
      :class="{ 'table-header__button--sortable': sortable }"
      type="button"
      @click="sortable ? emit('sort') : undefined"
    >
      <span>{{ label }}</span>
      <span v-if="sortable && sortDirection" class="table-header__indicator">
        {{ sortDirection === 'asc' ? '↑' : '↓' }}
      </span>
    </button>
    <span
      class="table-header__resizer"
      @mousedown.stop="emit('resizeStart', $event)"
    />
  </th>
</template>

<style scoped lang="scss">
.table-header {
  position: relative;
  padding: 0;
  text-align: left;
  background: $color-bg;
  border-bottom: 1px solid $color-border;
  white-space: nowrap;

  &__button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border: none;
    background: transparent;
    font-weight: 600;
    text-align: left;

    &--sortable {
      cursor: pointer;

      &:hover {
        color: $color-primary;
      }
    }
  }

  &__indicator {
    color: $color-primary;
    font-size: 0.75rem;
  }

  &__resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;

    &:hover {
      background: rgb(37 99 235 / 20%);
    }
  }
}
</style>
