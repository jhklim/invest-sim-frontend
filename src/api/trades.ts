import apiClient from './client'

export type PositionStatus = 'OPEN' | 'CLOSE'

export interface TradeResponse {
  id: number
  openPricePerShare: number
  openQuantity: number
  closeAmount: number | null
  profitAmount: number | null
  profitRate: number | null
  unrealizedProfit: number | null
  unrealizedProfitRate: number | null
  positionStatus: PositionStatus
  strategyId: number
  strategyName: string
  openedAt: string
  closedAt: string | null
}

export const getTrades = () =>
  apiClient.get<TradeResponse[]>('/trades')