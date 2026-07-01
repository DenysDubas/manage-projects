import { describe, expect, it } from 'vitest'
import { ApiRequestError } from '@/types'
import { getErrorMessage } from '@/utils/errors'

describe('getErrorMessage', () => {
  it('returns message from ApiRequestError', () => {
    const error = new ApiRequestError('projectId is required', 400)
    expect(getErrorMessage(error, 'fallback')).toBe('projectId is required')
  })

  it('returns message from Error', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('returns message from plain object', () => {
    expect(getErrorMessage({ message: 'plain' }, 'fallback')).toBe('plain')
  })

  it('returns fallback for unknown values', () => {
    expect(getErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
