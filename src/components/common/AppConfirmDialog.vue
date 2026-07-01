<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'

defineProps<{
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>()

const isOpen = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  confirm: []
}>()

function close(): void {
  isOpen.value = false
}

function onConfirm(): void {
  emit('confirm')
}
</script>

<template>
  <AppModal v-if="isOpen" :title="title" size="sm" @close="close">
    <p class="confirm-dialog__message">{{ message }}</p>

    <template #footer>
      <AppButton variant="secondary" :disabled="loading" @click="close">
        {{ cancelLabel ?? 'Скасувати' }}
      </AppButton>
      <AppButton variant="danger" :disabled="loading" @click="onConfirm">
        {{ confirmLabel ?? 'Видалити' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped lang="scss">
.confirm-dialog__message {
  margin: 0;
  color: $color-text;
  line-height: 1.5;
}
</style>
