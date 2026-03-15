import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as loginApi, logout as logoutApi, signup as signupApi } from '@/api/auth'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseJwtPayload(token: string): { sub: string; email: string } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const payload = parseJwtPayload(token)
      if (payload) {
        setUser({ id: payload.sub, email: payload.email })
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginApi({ email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      const payload = parseJwtPayload(data.accessToken)
      if (payload) {
        localStorage.setItem('memberId', payload.sub)
        setUser({ id: payload.sub, email: payload.email })
      }
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return { success: false, error: err.response?.data?.message || '로그인에 실패했습니다' }
    }
  }

  const signup = async (email: string, password: string, nickname: string) => {
    try {
      await signupApi({ email, password, nickname })
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return { success: false, error: err.response?.data?.message || '회원가입에 실패했습니다' }
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // API 실패해도 로컬 상태는 정리
    } finally {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('memberId')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}