import apiClient from './client'

export interface StrategyCondition {
  indicator: string
  indicatorValue: number
}

export interface StrategyResponse {
  id: number
  name: string
  description: string
  exchange: string
  market: string
  buyAmount: number
  active: boolean
  buyConditions: StrategyCondition[]
  sellConditions: StrategyCondition[]
}

export interface CreateStrategyRequest {
  name: string
  description?: string
  exchange: string
  market: string
  buyAmount: number
  buyConditions: StrategyCondition[]
  sellConditions: StrategyCondition[]
}

export const getStrategies = () =>
  apiClient.get<StrategyResponse[]>('/strategies')

export const createStrategy = (data: CreateStrategyRequest) =>
  apiClient.post<void>('/strategies', data)

export const activateStrategy = (id: number) =>
  apiClient.post<void>(`/strategies/${id}/activate`)

export const deactivateStrategy = (id: number) =>
  apiClient.post<void>(`/strategies/${id}/deactivate`)

export const deleteStrategy = (id: number) =>
  apiClient.delete<void>(`/strategies/${id}`)