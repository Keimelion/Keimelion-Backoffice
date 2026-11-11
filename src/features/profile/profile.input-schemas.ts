import { z } from 'zod'
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@keimelion/sdk/schemas'

const USERNAME_REGEX = /^[\p{L}\p{N}_-]+$/u

const trimmedUsernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${String(USERNAME_MIN_LENGTH)} character.`,
  })
  .max(USERNAME_MAX_LENGTH, {
    message: `Username must be at most ${String(USERNAME_MAX_LENGTH)} characters.`,
  })
  .regex(USERNAME_REGEX, {
    message: 'Username can only contain letters, digits, underscores, or dashes.',
  })

export const personalInfoFormSchema = z.object({
  username: trimmedUsernameSchema.nullable(),
  avatar: z.file().nullable(),
  clearAvatar: z.boolean(),
  isMarketingOptedIn: z.boolean(),
})

export type PersonalInfoFormValues = z.infer<typeof personalInfoFormSchema>

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: `New password must be at least ${String(MIN_PASSWORD_LENGTH)} characters.`,
      })
      .max(MAX_PASSWORD_LENGTH, {
        message: `New password must be at most ${String(MAX_PASSWORD_LENGTH)} characters.`,
      }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password.' }),
  })
  .superRefine((data, context) => {
    if (data.currentPassword.length > 0 && data.currentPassword === data.newPassword) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'New password must differ from current password.',
      })
    }
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      })
    }
  })

export type ChangePasswordFormInput = z.infer<typeof changePasswordInputSchema>
