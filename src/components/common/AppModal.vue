<script setup lang="ts">
defineProps<{
  title: string
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal" :class="[`modal--${size ?? 'md'}`]" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <button class="modal__close" type="button" aria-label="Close" @click="emit('close')">
            ×
          </button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(15 23 42 / 45%);
  backdrop-filter: blur(2px);
}

.modal {
  width: 100%;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  animation: modal-in 0.2s ease;

  &--sm {
    max-width: 420px;
  }

  &--md {
    max-width: 560px;
  }

  &--lg {
    max-width: 720px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid $color-border;
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
  }

  &__close {
    border: none;
    background: transparent;
    font-size: 1.5rem;
    line-height: 1;
    color: $color-muted;
    cursor: pointer;
  }

  &__body {
    padding: 1.25rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid $color-border;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
