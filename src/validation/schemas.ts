import { z } from 'zod'
import { ProjectStatus, TaskStatus } from '@/types'
import { todayIsoDate } from '@/utils/date'

export const projectFormSchema = z.object({
  name: z
    .string({ required_error: "Поле обов'язкове" })
    .trim()
    .min(1, "Поле обов'язкове")
    .min(2, 'Мінімум 2 символи')
    .max(100, 'Максимум 100 символів'),
  description: z.string().optional(),
})

export function createTaskFormSchema(isEditing: boolean) {
  return z.object({
    name: z
      .string({ required_error: "Поле обов'язкове" })
      .trim()
      .min(1, "Поле обов'язкове")
      .min(3, 'Мінімум 3 символи')
      .max(120, 'Максимум 120 символів'),
    assignee: z.string().nullable().optional(),
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE], {
      required_error: 'Оберіть статус',
    }),
    deadline: z
      .string({ required_error: "Поле обов'язкове" })
      .refine((value) => isEditing || value >= todayIsoDate(), {
        message: 'Дата не може бути в минулому',
      }),
  })
}

export type ProjectFormValues = z.infer<typeof projectFormSchema>
export type TaskFormValues = z.infer<ReturnType<typeof createTaskFormSchema>>

export { ProjectStatus, TaskStatus }
