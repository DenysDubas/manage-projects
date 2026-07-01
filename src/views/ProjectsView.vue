<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import ProjectFormModal from '@/components/projects/ProjectFormModal.vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import { useProjectTaskActions } from '@/composables/useProjectTaskActions'
import { useToast } from '@/composables/useToast'
import { useProjectsStore } from '@/stores/projects'
import type { ProjectWithTaskCount } from '@/types'

const projectsStore = useProjectsStore()
const { deleteProject } = useProjectTaskActions()
const { showToast } = useToast()

const isModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const projectToDelete = ref<ProjectWithTaskCount | null>(null)
const isDeleting = ref(false)

onMounted(async () => {
  await projectsStore.fetchProjects()
})

function requestDelete(project: ProjectWithTaskCount): void {
  projectToDelete.value = project
  isDeleteDialogOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!projectToDelete.value) return

  isDeleting.value = true
  try {
    await deleteProject(projectToDelete.value.id)
    showToast('Проект видалено')
    isDeleteDialogOpen.value = false
    projectToDelete.value = null
  } catch {
    showToast('Не вдалося видалити проект', 'error')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-header__title">Проекти</h1>
        <p class="page-header__subtitle">Управління проектами та завданнями</p>
      </div>
      <div class="page-header__actions">
        <AppButton @click="isModalOpen = true">Додати проект</AppButton>
      </div>
    </header>

    <div v-if="projectsStore.loading" class="loading-state">Завантаження...</div>
    <div v-else-if="projectsStore.error" class="error-state">{{ projectsStore.error }}</div>
    <ProjectsTable v-else :projects="projectsStore.projects" @delete="requestDelete" />

    <ProjectFormModal v-model="isModalOpen" />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="Видалити проект?"
      :message="`Проект «${projectToDelete?.name}» та всі його завдання будуть видалені.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </section>
</template>
