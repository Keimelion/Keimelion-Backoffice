import { axiosInstance } from '@/data-access/_shared/axios'

export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout', {})
}
