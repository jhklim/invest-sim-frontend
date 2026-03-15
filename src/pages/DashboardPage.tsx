import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getStrategies } from '@/api/strategies'
import { getTrades, type TradeResponse } from '@/api/trades'
import { TrendingUp, TrendingDown, Activity, LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

let currentBtcPrice = 68145.32

function getBtcPrice(): number {
  const change = currentBtcPrice * (Math.random() * 0.01 - 0.005)
  currentBtcPrice = Math.round((currentBtcPrice + change) * 100) / 100
  return currentBtcPrice
}

export default function DashboardPage() {
  const [btcPrice, setBtcPrice] = useState(68145.32)
  const [priceChange, setPriceChange] = useState(0)
  const [prevPrice, setPrevPrice] = useState(68145.32)
  const [activeStrategies, setActiveStrategies] = useState(0)
  const [totalStrategies, setTotalStrategies] = useState(0)
  const [trades, setTrades] = useState<TradeResponse[]>([])

  useEffect(() => {
    getStrategies().then(({ data }) => {
      setTotalStrategies(data.length)
      setActiveStrategies(data.filter((s) => s.active).length)
    })
    getTrades().then(({ data }) => setTrades(data))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = getBtcPrice()
      setPriceChange(newPrice - prevPrice)
      setPrevPrice(btcPrice)
      setBtcPrice(newPrice)
    }, 3000)
    return () => clearInterval(interval)
  }, [btcPrice, prevPrice])

  const openTrades = trades.filter((t) => t.positionStatus === 'OPEN')
  const totalProfitLoss = trades.reduce((sum, t) => sum + (t.profitAmount ?? 0), 0)
  const isPositiveChange = priceChange >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">트레이딩 시뮬레이션을 실시간으로 모니터링하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">BTC Price</CardTitle>
            <div className={isPositiveChange ? 'text-success' : 'text-destructive'}>
              {isPositiveChange ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(btcPrice)}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
              {isPositiveChange ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{formatCurrency(Math.abs(priceChange))}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 전략</CardTitle>
            <LineChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeStrategies}</div>
            <p className="text-sm text-muted-foreground mt-1">전체 {totalStrategies}개 중</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">오픈 포지션</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{openTrades.length}</div>
            <p className="text-sm text-muted-foreground mt-1">전체 {trades.length}개 거래</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">총 손익</CardTitle>
          <CardDescription>전체 거래의 손익 합산</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">수익 거래</p>
              <p className="text-success font-medium">
                {trades.filter((t) => (t.profitAmount ?? 0) > 0).length}개
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">손실 거래</p>
              <p className="text-destructive font-medium">
                {trades.filter((t) => (t.profitAmount ?? 0) < 0).length}개
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}