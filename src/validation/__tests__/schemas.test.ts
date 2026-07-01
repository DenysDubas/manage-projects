import { describe, expect, it } from 'vitest'
import { createTaskFormSchema, projectFormSchema } from '@/validation/schemas'

describe('projectFormSchema', () => {
  it('accepts valid project', () => {
    const result = projectFormSchema.safeParse({
      name: 'New Project',
      description: 'Optional',
    })
    expect(result.success).toBe(true)
  })

  it('shows required message for empty name', () => {
    const result = projectFormSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Поле обов'язкове")
    }
  })

  it('shows min length message for short name', () => {
    const result = projectFormSchema.safeParse({ name: 'c' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Мінімум 2 символи')
    }
  })

  it('rejects name longer than 100 chars', () => {
    const result = projectFormSchema.safeParse({ name: 'a'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Максимум 100 символів')
    }
  })
})

describe('createTaskFormSchema', () => {
  it('shows required message for empty name', () => {
    const schema = createTaskFormSchema(false)
    const result = schema.safeParse({
      name: '',
      status: 'todo',
      deadline: '2099-01-01',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Поле обов'язкове")
    }
  })

  it('shows min length message for short name', () => {
    const schema = createTaskFormSchema(false)
    const result = schema.safeParse({
      name: 'dd',
      status: 'todo',
      deadline: '2099-01-01',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Мінімум 3 символи')
    }
  })

  it('rejects past deadline for new task', () => {
    const schema = createTaskFormSchema(false)
    const result = schema.safeParse({
      name: 'Task name',
      status: 'todo',
      deadline: '2020-01-01',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Дата не може бути в минулому')).toBe(
        true,
      )
    }
  })

  it('allows past deadline when editing', () => {
    const schema = createTaskFormSchema(true)
    const result = schema.safeParse({
      name: 'Task name',
      status: 'done',
      deadline: '2020-01-01',
    })
    expect(result.success).toBe(true)
  })
})
