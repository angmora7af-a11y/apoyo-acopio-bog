import axios from 'axios'
import { useSessionStore } from '@/store/sessionStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = useSessionStore.getState().session?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession()
    }
    return Promise.reject(error)
  },
)

export default client
