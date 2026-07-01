<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import ProjectStatsChart from '@/components/tasks/ProjectStatsChart.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import TasksKanban from '@/components/tasks/TasksKanban.vue'
import TasksTable from '@/components/tasks/TasksTable.vue'
import { useProjectTaskActions } from '@/composables/useProjectTaskActions'
import { useToast } from '@/composables/useToast'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types'
import { ViewMode } from '@/types'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { deleteProject, deleteTask } = useProjectTaskActions()
const { showToast } = useToast()

const projectId = computed(() => Number(props.id))
const viewMode = ref<ViewMode>(ViewMode.TABLE)
const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)

const isDeleteProjectDialogOpen = ref(false)
const isDeleteTaskDialogOpen = ref(false)
const taskToDelete = ref<Task | null>(null)
const isDeleting = ref(false)

const project = computed(() => projectsStore.getProjectById(projectId.value))
const tasks = computed(() => tasksStore.getTasksByProject(projectId.value))
const viewModeStorageKey = computed(() => `pm_view_mode_${projectId.value}`)

const projectNotFound = computed(
  () =>
    !projectsStore.loading &&
    projectsStore.projects.length > 0 &&
    project.value === undefined,
)

function isViewMode(value: string | null): value is ViewMode {
  return value === ViewMode.TABLE || value === ViewMode.KANBAN
}

function loadViewMode(): void {
  const saved = localStorage.getItem(viewModeStorageKey.value)
  viewMode.value = isViewMode(saved) ? saved : ViewMode.TABLE
}

function setViewMode(mode: ViewMode): void {
  viewMode.value = mode
  localStorage.setItem(viewModeStorageKey.value, mode)
}

async function loadData(): Promise<void> {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
  if (projectsStore.getProjectById(projectId.value)) {
    await tasksStore.fetchTasks(projectId.value)
  }
}

function openCreateTask(): void {
  editingTask.value = null
  isTaskModalOpen.value = true
}

function openEditTask(task: Task): void {
  editingTask.value = task
  isTaskModalOpen.value = true
}

function requestDeleteTask(task: Task): void {
  taskToDelete.value = task
  isDeleteTaskDialogOpen.value = true
}

async function confirmDeleteTask(): Promise<void> {
  if (!taskToDelete.value) return

  isDeleting.value = true
  try {
    await deleteTask(taskToDelete.value.id)
    showToast('Завдання видалено')
    isDeleteTaskDialogOpen.value = false
    taskToDelete.value = null
  } catch {
    showToast('Не вдалося видалити завдання', 'error')
  } finally {
    isDeleting.value = false
  }
}

async function confirmDeleteProject(): Promise<void> {
  isDeleting.value = true
  try {
    await deleteProject(projectId.value)
    showToast('Проект видалено')
    await router.push({ name: 'projects' })
  } catch {
    showToast('Не вдалося видалити проект', 'error')
  } finally {
    isDeleting.value = false
    isDeleteProjectDialogOpen.value = false
  }
}

onMounted(async () => {
  loadViewMode()
  await loadData()
})

watch(
  () => route.params.id,
  async () => {
    loadViewMode()
    await loadData()
  },
)
</script>

<template>
  <section class="page">
    <div v-if="projectNotFound" class="error-state card not-found">
      <h2>Проект не знайдено</h2>
      <p>Проект з ID {{ projectId }} не існує.</p>
      <AppButton @click="router.push({ name: 'projects' })">← До списку проектів</AppButton>
    </div>

    <template v-else>
      <header class="page-header">
        <div>
          <button class="back-link" type="button" @click="router.push({ name: 'projects' })">
            ← Назад до проектів
          </button>
          <h1 class="page-header__title">{{ project?.name ?? 'Проект' }}</h1>
          <p v-if="project?.description" class="page-header__subtitle">
            {{ project.description }}
          </p>
        </div>
        <div class="page-header__actions">
          <div class="view-toggle">
            <button
              class="view-toggle__btn"
              :class="{ 'view-toggle__btn--active': viewMode === ViewMode.TABLE }"
              type="button"
              @click="setViewMode(ViewMode.TABLE)"
            >
              📋 Таблиця
            </button>
            <button
              class="view-toggle__btn"
              :class="{ 'view-toggle__btn--active': viewMode === ViewMode.KANBAN }"
              type="button"
              @click="setViewMode(ViewMode.KANBAN)"
            >
              📌 Канбан
            </button>
          </div>
          <AppButton variant="danger" @click="isDeleteProjectDialogOpen = true">
            Видалити проект
          </AppButton>
          <AppButton @click="openCreateTask">Додати завдання</AppButton>
        </div>
      </header>

      <ProjectStatsChart :tasks="tasks" />

      <div v-if="tasksStore.loading" class="loading-state">Завантаження...</div>
      <div v-else-if="tasksStore.error" class="error-state">{{ tasksStore.error }}</div>
      <Transition v-else name="fade" mode="out-in">
        <TasksTable
          v-if="viewMode === ViewMode.TABLE"
          :project-id="projectId"
          :tasks="tasks"
          @edit="openEditTask"
          @delete="requestDeleteTask"
        />
        <TasksKanban
          v-else
          :project-id="projectId"
          @edit="openEditTask"
          @delete="requestDeleteTask"
        />
      </Transition>

      <TaskFormModal
        v-model="isTaskModalOpen"
        :project-id="projectId"
        :task="editingTask"
      />

      <AppConfirmDialog
        v-model="isDeleteProjectDialogOpen"
        title="Видалити проект?"
        :message="`Проект «${project?.name}» та всі його завдання будуть видалені.`"
        :loading="isDeleting"
        @confirm="confirmDeleteProject"
      />

      <AppConfirmDialog
        v-model="isDeleteTaskDialogOpen"
        title="Видалити завдання?"
        :message="`Завдання «${taskToDelete?.name}» буде видалене.`"
        :loading="isDeleting"
        @confirm="confirmDeleteTask"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.back-link {
  display: inline-block;
  margin-bottom: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: $color-primary;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem;

  h2 {
    margin: 0;
  }

  p {
    margin: 0;
    color: $color-muted;
  }
}
</style>
