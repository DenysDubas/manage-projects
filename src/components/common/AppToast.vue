<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span>{{ toast.text }}</span>
          <button class="toast__close" type="button" @click="removeToast(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 240px;
  padding: 0.75rem 1rem;
  border-radius: $radius-md;
  color: #fff;
  box-shadow: $shadow-md;

  &--success {
    background: $color-success;
  }

  &--error {
    background: $color-danger;
  }

  &--info {
    background: $color-primary;
  }

  &__close {
    margin-left: auto;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1.125rem;
    cursor: pointer;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
