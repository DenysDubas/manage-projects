<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import { useProjectTaskActions } from '@/composables/useProjectTaskActions'
import { useToast } from '@/composables/useToast'
import { useTasksStore } from '@/stores/tasks'
import { todayIsoDate } from '@/utils/date'
import { createTaskFormSchema, TaskStatus, type TaskFormValues } from '@/validation/schemas'
import type { Task } from '@/types'

const props = defineProps<{
  projectId: number
  task?: Task | null
}>()

const isOpen = defineModel<boolean>({ required: true })

const tasksStore = useTasksStore()
const { createTask } = useProjectTaskActions()
const { showToast } = useToast()

const isEditing = computed(() => Boolean(props.task))

const validationSchema = computed(() =>
  toTypedSchema(createTaskFormSchema(isEditing.value)),
)

const { defineField, errors, handleSubmit, isSubmitting, resetForm, setValues } =
  useForm<TaskFormValues>({
    validationSchema,
    initialValues: {
      name: '',
      assignee: '',
      status: TaskStatus.TODO,
      deadline: todayIsoDate(),
    },
  })

const [name, nameAttrs] = defineField('name', { validateOnBlur: true })
const [assignee, assigneeAttrs] = defineField('assignee', { validateOnBlur: true })
const [status, statusAttrs] = defineField('status', { validateOnBlur: true })
const [deadline, deadlineAttrs] = defineField('deadline', { validateOnBlur: true })

watch(
  [() => props.task, isOpen],
  ([task, open]) => {
    if (!open) return

    if (task) {
      setValues({
        name: task.name,
        assignee: task.assignee ?? '',
        status: task.status,
        deadline: task.deadline,
      })
      return
    }

    resetForm({
      values: {
        name: '',
        assignee: '',
        status: TaskStatus.TODO,
        deadline: todayIsoDate(),
      },
    })
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (values) => {
  try {
    if (props.task) {
      await tasksStore.updateTask(props.task.id, {
        name: values.name,
        assignee: values.assignee || null,
        status: values.status,
        deadline: values.deadline,
      })
      showToast('Завдання оновлено')
    } else {
      await createTask({
        projectId: props.projectId,
        name: values.name,
        assignee: values.assignee || null,
        status: values.status,
        deadline: values.deadline,
      })
      showToast('Завдання створено')
    }
    isOpen.value = false
    resetForm()
  } catch {
    showToast('Не вдалося зберегти завдання', 'error')
  }
})

function closeModal(): void {
  isOpen.value = false
  resetForm()
}
</script>

<template>
  <AppModal
    v-if="isOpen"
    :title="isEditing ? 'Редагувати завдання' : 'Додати завдання'"
    @close="closeModal"
  >
    <form id="task-form" class="task-form" @submit.prevent="onSubmit">
      <AppInput
        v-model="name"
        v-bind="nameAttrs"
        label="Назва завдання"
        required
        :error="errors.name"
      />
      <AppInput
        :model-value="assignee ?? ''"
        label="Виконавець"
        :error="errors.assignee"
        @update:model-value="assignee = $event || null"
        @blur="assigneeAttrs.onBlur"
      />
      <AppSelect
        v-model="status"
        v-bind="statusAttrs"
        label="Статус"
        required
        :error="errors.status"
      >
        <option :value="TaskStatus.TODO">To Do</option>
        <option :value="TaskStatus.IN_PROGRESS">In Progress</option>
        <option :value="TaskStatus.DONE">Done</option>
      </AppSelect>
      <AppInput
        v-model="deadline"
        v-bind="deadlineAttrs"
        label="Дедлайн"
        type="date"
        required
        :error="errors.deadline"
      />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="closeModal">Скасувати</AppButton>
      <AppButton type="submit" form="task-form" :disabled="isSubmitting">
        {{ isEditing ? 'Зберегти' : 'Створити' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped lang="scss">
.task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
