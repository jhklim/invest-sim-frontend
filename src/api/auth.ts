import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  nickname: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/auth/login', data)

export const signup = (data: SignupRequest) =>
  apiClient.post<void>('/auth/signup', data)

export const logout = () =>
  apiClient.post<void>('/auth/logout')

export const refresh = (data: { memberId: number; refreshToken: string }) =>
  apiClient.post<LoginResponse>('/auth/refresh', data)