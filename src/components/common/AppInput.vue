<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  modelValue: string
  label: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const fieldId = useId()
const errorId = computed(() => `${fieldId}-error`)
</script>

<template>
  <div class="form-field">
    <label class="form-field__label" :for="fieldId">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>
    <input
      :id="fieldId"
      class="form-field__input"
      :class="{ 'form-field__input--error': error }"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <span v-if="error" :id="errorId" class="form-field__error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__required {
    color: $color-danger;
  }

  &__input {
    padding: 0.625rem 0.75rem;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background: $color-surface;
    transition: border-color $transition, box-shadow $transition;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgb(37 99 235 / 15%);
    }

    &--error {
      border-color: $color-danger;
    }
  }

  &__error {
    font-size: 0.8125rem;
    color: $color-danger;
  }
}
</style>
