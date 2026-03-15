import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { activateStrategy, deactivateStrategy, type StrategyResponse } from '@/api/strategies'
import { Circle, Play, Pause } from 'lucide-react'

interface Props {
  strategy: StrategyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChanged: (id: number, active: boolean) => void
}

export function StrategyDetailModal({ strategy, open, onOpenChange, onStatusChanged }: Props) {
  if (!strategy) return null

  const handleToggle = async () => {
    try {
      if (strategy.active) {
        await deactivateStrategy(strategy.id)
      } else {
        await activateStrategy(strategy.id)
      }
      onStatusChanged(strategy.id, !strategy.active)
    } catch {
      // 에러 toast는 client.ts 인터셉터에서 처리
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Circle
              className={`h-2.5 w-2.5 fill-current shrink-0 ${
                strategy.active ? 'text-success' : 'text-muted-foreground'
              }`}
            />
            {strategy.name}
          </DialogTitle>
          <DialogDescription>
            {strategy.description || '설명 없음'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-3">
            <InfoItem label="거래소" value={strategy.exchange} />
            <InfoItem label="마켓" value={strategy.market} mono />
            <InfoItem label="매수 금액" value={strategy.buyAmount.toLocaleString() + ' KRW'} mono />
          </div>

          {/* 매수 조건 */}
          <ConditionList title="매수 조건" conditions={strategy.buyConditions} />

          {/* 매도 조건 */}
          <ConditionList title="매도 조건" conditions={strategy.sellConditions} />

          {/* 액션 */}
          <div className="flex justify-end pt-1">
            <Button
              variant={strategy.active ? 'secondary' : 'default'}
              onClick={handleToggle}
            >
              {strategy.active ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  비활성화
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  활성화
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function ConditionList({
  title,
  conditions,
}: {
  title: string
  conditions: { indicator: string; indicatorValue: number }[]
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{title}</p>
      {conditions.length === 0 ? (
        <p className="text-sm text-muted-foreground">조건 없음</p>
      ) : (
        <div className="space-y-1.5">
          {conditions.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="font-mono text-foreground">{c.indicator}</span>
              <span className="text-muted-foreground font-mono">{c.indicatorValue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}