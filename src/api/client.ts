import axios, { isAxiosError } from 'axios'
import { mockAdapter } from '@/api/mock-adapter'
import { ApiRequestError } from '@/types'

const apiClient = axios.create({
  baseURL: '/api',
  adapter: mockAdapter,
  headers: {
    'Content-Type': 'application/json',
  },
})

function toApiError(error: unknown): ApiRequestError {
  if (isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Unknown API error'
    return new ApiRequestError(message, error.response?.status ?? 500)
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message, 500)
  }

  return new ApiRequestError('Unknown error', 500)
}

export async function apiGet<T>(url: string, params?: Record<string, string | number>): Promise<T> {
  try {
    const response = await apiClient.get<T>(url, { params })
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function apiPost<T, P = unknown>(url: string, payload: P): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, payload)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function apiPut<T, P = unknown>(url: string, payload: P): Promise<T> {
  try {
    const response = await apiClient.put<T>(url, payload)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function apiDelete(url: string): Promise<void> {
  try {
    await apiClient.delete(url)
  } catch (error) {
    throw toApiError(error)
  }
}
