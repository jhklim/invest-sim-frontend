import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getTrades, type TradeResponse } from '@/api/trades'
import { Circle } from 'lucide-react'

function formatDateTime(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

function ProfitCell({ amount, rate }: { amount: number; rate: number }) {
  const color = amount >= 0 ? 'text-success' : 'text-destructive'
  return (
    <div className="space-y-0.5">
      <p className={`font-medium ${color}`}>
        {amount >= 0 ? '+' : ''}{formatCurrency(amount)}
      </p>
      <p className={`text-xs ${color}`}>
        {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
      </p>
    </div>
  )
}

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrades()
      .then(({ data }) => setTrades(data))
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      getTrades().then(({ data }) => setTrades(data))
    }, 10_000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const openTrades = trades.filter((t) => t.positionStatus === 'OPEN')
  const closedTrades = trades.filter((t) => t.positionStatus === 'CLOSE')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Trades</h2>
        <p className="text-muted-foreground mt-1">전체 거래 내역을 확인하세요</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">오픈 포지션</CardTitle>
          <CardDescription>{openTrades.length}개 활성 포지션</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">전략</TableHead>
                <TableHead className="text-muted-foreground">진입가</TableHead>
                <TableHead className="text-muted-foreground">수량</TableHead>
                <TableHead className="text-muted-foreground">손익 / 수익률</TableHead>
                <TableHead className="text-muted-foreground">체결시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openTrades.map((trade) => (
                <TableRow key={trade.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-success text-success" />
                      <span className="font-medium text-foreground">{trade.strategyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-mono">
                    {formatCurrency(trade.openPricePerShare)}
                  </TableCell>
                  <TableCell className="text-foreground font-mono">
                    {trade.openQuantity}
                  </TableCell>
                  <TableCell>
                    {trade.unrealizedProfit != null && trade.unrealizedProfitRate != null ? (
                      <ProfitCell amount={trade.unrealizedProfit} rate={trade.unrealizedProfitRate} />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(trade.openedAt)}
                  </TableCell>
                </TableRow>
              ))}
              {openTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    오픈 포지션이 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">종료된 거래</CardTitle>
          <CardDescription>{closedTrades.length}개 완료된 거래</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">전략</TableHead>
                <TableHead className="text-muted-foreground">진입가</TableHead>
                <TableHead className="text-muted-foreground">수량</TableHead>
                <TableHead className="text-muted-foreground">매도 금액</TableHead>
                <TableHead className="text-muted-foreground">손익 / 수익률</TableHead>
                <TableHead className="text-muted-foreground">진입시간</TableHead>
                <TableHead className="text-muted-foreground">종료시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedTrades.map((trade) => (
                <TableRow key={trade.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
                      <span className="font-medium text-foreground">{trade.strategyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-mono">
                    {formatCurrency(trade.openPricePerShare)}
                  </TableCell>
                  <TableCell className="text-foreground font-mono">
                    {trade.openQuantity}
                  </TableCell>
                  <TableCell className="text-foreground font-mono">
                    {trade.closeAmount != null ? formatCurrency(trade.closeAmount) : '-'}
                  </TableCell>
                  <TableCell>
                    {trade.profitAmount != null && trade.profitRate != null ? (
                      <ProfitCell amount={trade.profitAmount} rate={trade.profitRate} />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(trade.openedAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(trade.closedAt)}
                  </TableCell>
                </TableRow>
              ))}
              {closedTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    종료된 거래가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}