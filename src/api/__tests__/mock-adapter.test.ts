import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '@/api/mock-adapter'
import { ensureStorageInitialized } from '@/api/storage'

function createConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {},
): InternalAxiosRequestConfig {
  return {
    method: 'get',
    url: '/tasks',
    headers: {},
    ...overrides,
  } as InternalAxiosRequestConfig
}

describe('mockAdapter', () => {
  beforeEach(() => {
    ensureStorageInitialized()
  })

  it('returns tasks when projectId is passed via config.params', async () => {
    const response = await mockAdapter(
      createConfig({
        url: '/tasks',
        params: { projectId: 1 },
      }),
    )

    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.data).toHaveLength(3)
    expect(response.data[0]).toMatchObject({ projectId: 1 })
  })

  it('returns tasks when projectId is in the URL query string', async () => {
    const response = await mockAdapter(
      createConfig({
        url: '/tasks?projectId=2',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.data).toHaveLength(2)
    expect(response.data.every((task: { projectId: number }) => task.projectId === 2)).toBe(true)
  })

  it('returns 400 when projectId is missing', async () => {
    await expect(mockAdapter(createConfig({ url: '/tasks' }))).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: 'projectId is required' },
      },
    })
  })

  it('returns projects list', async () => {
    const response = await mockAdapter(
      createConfig({
        url: '/projects',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.data).toHaveLength(3)
    expect(response.data[0]).toMatchObject({
      id: 1,
      taskCount: 3,
    })
  })

  it('cascades task deletion when project is deleted', async () => {
    await mockAdapter(
      createConfig({
        method: 'delete',
        url: '/projects/1',
      }),
    )

    const tasksResponse = await mockAdapter(
      createConfig({
        url: '/tasks',
        params: { projectId: 1 },
      }),
    )

    expect(tasksResponse.data).toHaveLength(0)
  })

  it('batch updates task order and status in a single request', async () => {
    const response = await mockAdapter(
      createConfig({
        method: 'put',
        url: '/tasks/reorder',
        data: {
          updates: [
            { id: 1, order: 1, status: 'in_progress' },
            { id: 2, order: 0, status: 'todo' },
          ],
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(response.data).toHaveLength(2)
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, order: 1, status: 'in_progress' }),
        expect.objectContaining({ id: 2, order: 0, status: 'todo' }),
      ]),
    )
  })
})
