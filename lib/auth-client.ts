// Client-side auth helper - wraps the API client for easier use
import { api } from './api-client'

export async function getCurrentUser() {
  const { data } = await api.getCurrentUser()
  if (data && (data as any).user) {
    return (data as any).user
  }
  return null
}

export async function logout() {
  await api.logout()
}
