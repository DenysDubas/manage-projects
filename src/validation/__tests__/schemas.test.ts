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

  it('rejects short name', () => {
    const result = projectFormSchema.safeParse({ name: 'A' })
    expect(result.success).toBe(false)
  })
})

describe('createTaskFormSchema', () => {
  it('rejects past deadline for new task', () => {
    const schema = createTaskFormSchema(false)
    const result = schema.safeParse({
      name: 'Task name',
      status: 'todo',
      deadline: '2020-01-01',
    })
    expect(result.success).toBe(false)
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
