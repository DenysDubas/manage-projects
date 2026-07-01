<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useColumnResize } from '@/composables/useColumnResize'
import { useTableSort } from '@/composables/useTableSort'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TableHeader from '@/components/common/TableHeader.vue'
import { formatDate } from '@/utils/date'
import type { ProjectStatus, ProjectWithTaskCount } from '@/types'

type ProjectColumn = 'id' | 'name' | 'taskCount' | 'status' | 'createdAt'

const props = defineProps<{
  projects: ProjectWithTaskCount[]
}>()

const emit = defineEmits<{
  delete: [project: ProjectWithTaskCount]
}>()

const router = useRouter()
const searchQuery = ref('')
const statusFilter = ref<'all' | ProjectStatus>('all')

const { toggleSort, sortItems, getSortIndicator } = useTableSort<ProjectColumn>()
const { columnWidths, startResize } = useColumnResize('projects-table-widths', {
  id: 80,
  name: 220,
  taskCount: 140,
  status: 120,
  createdAt: 160,
  actions: 100,
})

const filteredProjects = computed(() => {
  let result = props.projects

  if (statusFilter.value !== 'all') {
    result = result.filter((project) => project.status === statusFilter.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((project) => project.name.toLowerCase().includes(query))
  }

  return sortItems(result, (project, key) => {
    switch (key) {
      case 'id':
        return project.id
      case 'name':
        return project.name
      case 'taskCount':
        return project.taskCount
      case 'status':
        return project.status
      case 'createdAt':
        return project.createdAt
      default:
        return null
    }
  })
})

function formatProjectDate(value: string): string {
  return formatDate(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openProject(projectId: number): void {
  router.push({ name: 'project-detail', params: { id: projectId } })
}

function onResizeStart(column: ProjectColumn | 'actions', event: MouseEvent): void {
  startResize(column, event.clientX)
}
</script>

<template>
  <div class="card projects-table">
    <div class="filters-bar">
      <AppInput
        v-model="searchQuery"
        label="Пошук"
        placeholder="Знайти проект..."
      />
      <AppSelect v-model="statusFilter" label="Статус">
        <option value="all">Усі</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </AppSelect>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <TableHeader
              label="ID"
              sortable
              :sort-direction="getSortIndicator('id')"
              :width="columnWidths.id"
              @sort="toggleSort('id')"
              @resize-start="onResizeStart('id', $event)"
            />
            <TableHeader
              label="Назва"
              sortable
              :sort-direction="getSortIndicator('name')"
              :width="columnWidths.name"
              @sort="toggleSort('name')"
              @resize-start="onResizeStart('name', $event)"
            />
            <TableHeader
              label="Кількість завдань"
              sortable
              :sort-direction="getSortIndicator('taskCount')"
              :width="columnWidths.taskCount"
              @sort="toggleSort('taskCount')"
              @resize-start="onResizeStart('taskCount', $event)"
            />
            <TableHeader
              label="Статус"
              sortable
              :sort-direction="getSortIndicator('status')"
              :width="columnWidths.status"
              @sort="toggleSort('status')"
              @resize-start="onResizeStart('status', $event)"
            />
            <TableHeader
              label="Дата створення"
              sortable
              :sort-direction="getSortIndicator('createdAt')"
              :width="columnWidths.createdAt"
              @sort="toggleSort('createdAt')"
              @resize-start="onResizeStart('createdAt', $event)"
            />
            <TableHeader label="" :width="columnWidths.actions" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in filteredProjects"
            :key="project.id"
            class="data-table__row"
            @click="openProject(project.id)"
          >
            <td :style="{ width: `${columnWidths.id}px` }">{{ project.id }}</td>
            <td :style="{ width: `${columnWidths.name}px` }">{{ project.name }}</td>
            <td :style="{ width: `${columnWidths.taskCount}px` }">{{ project.taskCount }}</td>
            <td :style="{ width: `${columnWidths.status}px` }">
              <StatusBadge :status="project.status" />
            </td>
            <td :style="{ width: `${columnWidths.createdAt}px` }">
              {{ formatProjectDate(project.createdAt) }}
            </td>
            <td :style="{ width: `${columnWidths.actions}px` }" @click.stop>
              <AppButton
                variant="ghost"
                title="Видалити проект"
                @click="emit('delete', project)"
              >
                🗑
              </AppButton>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0">
            <td colspan="6" class="empty-state">Проектів не знайдено</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/data-table' as *;

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  @include data-table-row-clickable;
}
</style>
