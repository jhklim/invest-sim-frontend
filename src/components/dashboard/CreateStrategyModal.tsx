import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createStrategy } from '@/api/strategies'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Condition {
  indicator: string
  indicatorValue: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const EXCHANGES = ['UPBIT']
const MARKETS = ['KRW-BTC']
const INDICATORS = ['RSI', 'VOLUME']

const defaultCondition = (): Condition => ({ indicator: 'RSI', indicatorValue: '' })

export function CreateStrategyModal({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [exchange, setExchange] = useState('UPBIT')
  const [market, setMarket] = useState('KRW-BTC')
  const [buyAmount, setBuyAmount] = useState('')
  const [buyConditions, setBuyConditions] = useState<Condition[]>([defaultCondition()])
  const [sellConditions, setSellConditions] = useState<Condition[]>([defaultCondition()])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setName('')
    setDescription('')
    setExchange('UPBIT')
    setMarket('KRW-BTC')
    setBuyAmount('')
    setBuyConditions([defaultCondition()])
    setSellConditions([defaultCondition()])
    setError('')
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm()
    onOpenChange(val)
  }

  const updateCondition = (
    list: Condition[],
    setList: (c: Condition[]) => void,
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    setList(list.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const addCondition = (list: Condition[], setList: (c: Condition[]) => void) => {
    setList([...list, defaultCondition()])
  }

  const removeCondition = (list: Condition[], setList: (c: Condition[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await createStrategy({
        name,
        description: description || undefined,
        exchange,
        market,
        buyAmount: Number(buyAmount),
        buyConditions: buyConditions.map((c) => ({
          indicator: c.indicator,
          indicatorValue: Number(c.indicatorValue),
        })),
        sellConditions: sellConditions.map((c) => ({
          indicator: c.indicator,
          indicatorValue: Number(c.indicatorValue),
        })),
      })
      onCreated()
      handleOpenChange(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || '전략 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 전략 만들기</DialogTitle>
          <DialogDescription>트레이딩 전략을 설정하세요</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 기본 정보 */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                전략 이름 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="예: RSI 과매도 전략"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">설명</label>
              <Input
                placeholder="전략 설명 (선택)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  거래소 <span className="text-destructive">*</span>
                </label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className={cn(
                    'w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground',
                    'focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
                  )}
                >
                  {EXCHANGES.map((ex) => (
                    <option key={ex} value={ex} className="bg-card">{ex}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  마켓 <span className="text-destructive">*</span>
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className={cn(
                    'w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground',
                    'focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
                  )}
                >
                  {MARKETS.map((m) => (
                    <option key={m} value={m} className="bg-card">{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                매수 금액 <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="예: 10000"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                min="0"
                step="any"
                required
              />
            </div>
          </div>

          {/* 매수 조건 */}
          <ConditionSection
            title="매수 조건"
            conditions={buyConditions}
            indicators={INDICATORS}
            onUpdate={(i, field, val) => updateCondition(buyConditions, setBuyConditions, i, field, val)}
            onAdd={() => addCondition(buyConditions, setBuyConditions)}
            onRemove={(i) => removeCondition(buyConditions, setBuyConditions, i)}
          />

          {/* 매도 조건 */}
          <ConditionSection
            title="매도 조건"
            conditions={sellConditions}
            indicators={INDICATORS}
            onUpdate={(i, field, val) => updateCondition(sellConditions, setSellConditions, i, field, val)}
            onAdd={() => addCondition(sellConditions, setSellConditions)}
            onRemove={(i) => removeCondition(sellConditions, setSellConditions, i)}
          />

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">취소</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '생성 중...' : '전략 생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ConditionSectionProps {
  title: string
  conditions: Condition[]
  indicators: string[]
  onUpdate: (index: number, field: keyof Condition, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

function ConditionSection({ title, conditions, indicators, onUpdate, onAdd, onRemove }: ConditionSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{title}</label>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="h-7 px-2 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          추가
        </Button>
      </div>
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={condition.indicator}
              onChange={(e) => onUpdate(index, 'indicator', e.target.value)}
              className={cn(
                'h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground',
                'focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
              )}
            >
              {indicators.map((ind) => (
                <option key={ind} value={ind} className="bg-card">{ind}</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="값"
              value={condition.indicatorValue}
              onChange={(e) => onUpdate(index, 'indicatorValue', e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              disabled={conditions.length === 1}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}