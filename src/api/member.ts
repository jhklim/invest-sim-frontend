import apiClient from './client'

export interface MemberResponse {
  nickname: string
  email: string
  totalAsset: number
  balance: number
  availableBalance: number
  reservedAmount: number
  openPositionValue: number
}

export const getMyInfo = () =>
  apiClient.get<MemberResponse>('/members/me')