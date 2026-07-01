import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsApi } from '@/api'
import { getErrorMessage } from '@/utils/errors'
import type {
  CreateProjectPayload,
  ProjectWithTaskCount,
  UpdateProjectPayload,
} from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<ProjectWithTaskCount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      projects.value = await projectsApi.getAll()
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load projects')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: CreateProjectPayload): Promise<ProjectWithTaskCount> {
    error.value = null
    try {
      const project = await projectsApi.create(payload)
      projects.value = [...projects.value, project]
      return project
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to create project')
      throw err
    }
  }

  async function updateProject(
    id: number,
    payload: UpdateProjectPayload,
  ): Promise<ProjectWithTaskCount> {
    error.value = null
    try {
      const updated = await projectsApi.update(id, payload)
      projects.value = projects.value.map((project) =>
        project.id === id ? updated : project,
      )
      return updated
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to update project')
      throw err
    }
  }

  async function deleteProject(id: number): Promise<void> {
    error.value = null
    try {
      await projectsApi.remove(id)
      projects.value = projects.value.filter((project) => project.id !== id)
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to delete project')
      throw err
    }
  }

  function getProjectById(id: number): ProjectWithTaskCount | undefined {
    return projects.value.find((project) => project.id === id)
  }

  function refreshTaskCount(projectId: number, delta: number): void {
    projects.value = projects.value.map((project) =>
      project.id === projectId
        ? { ...project, taskCount: Math.max(0, project.taskCount + delta) }
        : project,
    )
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshTaskCount,
  }
})
