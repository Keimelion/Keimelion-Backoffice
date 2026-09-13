import { z } from 'zod'
import { axiosInstance } from '@/data-access/_shared/axios'
import { parseApiResponse } from '@/data-access/_shared/parse-response'
import { apiUserSchema } from '@/data-access/_shared/user'

export const loginInputSchema = z.object({
  email: z
    .email({ message: 'Enter a valid email address.' })
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: apiUserSchema,
})

export type LoginInput = z.infer<typeof loginInputSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await axiosInstance.post<unknown>('/auth/login', input)
  return parseApiResponse(loginResponseSchema, response, 'login')
}
