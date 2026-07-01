<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>()
</script>

<template>
  <button
    class="app-button"
    :class="[`app-button--${variant ?? 'primary'}`]"
    :type="type ?? 'button'"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid transparent;
  border-radius: $radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: background $transition, border-color $transition, color $transition;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background: $color-primary;
    color: #fff;

    &:hover:not(:disabled) {
      background: $color-primary-hover;
    }
  }

  &--secondary {
    background: $color-surface;
    border-color: $color-border;
    color: $color-text;

    &:hover:not(:disabled) {
      background: $color-bg;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-muted;

    &:hover:not(:disabled) {
      background: $color-bg;
      color: $color-text;
    }
  }

  &--danger {
    background: $color-danger;
    color: #fff;
  }
}
</style>
