import apiClient from './client'

export interface MarketPriceResponse {
  market: string
  price: number
}

export const getMarketPrice = (market: string) =>
  apiClient.get<MarketPriceResponse>('/market/price', { params: { market } })