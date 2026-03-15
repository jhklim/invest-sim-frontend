import axios from 'axios'
import { toast } from 'sonner'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 무한루프 방지: refresh 요청 자체가 401이면 바로 로그인 페이지로
      if (error.config?.url?.includes('/auth/refresh')) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      const memberId = localStorage.getItem('memberId')
      const refreshToken = localStorage.getItem('refreshToken')

      if (memberId && refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/refresh`, {
            memberId: Number(memberId),
            refreshToken,
          })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)

          // 원래 요청 재시도
          error.config.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient.request(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const message = error.response?.data?.message || '오류가 발생했습니다'
    toast.error(message)
    return Promise.reject(error)
  }
)

export default apiClient