<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppTextarea from '@/components/common/AppTextarea.vue'
import { useToast } from '@/composables/useToast'
import { useProjectsStore } from '@/stores/projects'
import { projectFormSchema, type ProjectFormValues } from '@/validation/schemas'

const emit = defineEmits<{
  created: []
}>()

const isOpen = defineModel<boolean>({ required: true })

const projectsStore = useProjectsStore()
const { showToast } = useToast()

const { defineField, errors, handleSubmit, isSubmitting, resetForm } = useForm<ProjectFormValues>({
  validationSchema: toTypedSchema(projectFormSchema),
  initialValues: {
    name: '',
    description: '',
  },
})

const [name, nameAttrs] = defineField('name', { validateOnBlur: true })
const [description, descriptionAttrs] = defineField('description', { validateOnBlur: true })

const onSubmit = handleSubmit(async (values) => {
  try {
    await projectsStore.createProject({
      name: values.name,
      description: values.description,
    })
    showToast('Проект створено')
    resetForm()
    isOpen.value = false
    emit('created')
  } catch {
    showToast('Не вдалося створити проект', 'error')
  }
})

function closeModal(): void {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <AppModal v-if="isOpen" title="Додати проект" @close="closeModal">
    <form id="project-form" class="project-form" @submit.prevent="onSubmit">
      <AppInput
        v-model="name"
        v-bind="nameAttrs"
        label="Назва"
        required
        :error="errors.name"
      />
      <AppTextarea
        :model-value="description ?? ''"
        label="Опис"
        :error="errors.description"
        @update:model-value="description = $event"
        @blur="descriptionAttrs.onBlur"
      />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="closeModal">Скасувати</AppButton>
      <AppButton type="submit" form="project-form" :disabled="isSubmitting">
        Створити
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped lang="scss">
.project-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
