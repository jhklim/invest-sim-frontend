import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getStrategies, activateStrategy, deactivateStrategy, deleteStrategy, type StrategyResponse } from '@/api/strategies'
import { CreateStrategyModal } from '@/components/dashboard/CreateStrategyModal'
import { StrategyDetailModal } from '@/components/dashboard/StrategyDetailModal'
import { Play, Pause, Circle, Plus, Eye, Trash2 } from 'lucide-react'

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<StrategyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StrategyResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchStrategies = () => {
    setLoading(true)
    getStrategies()
      .then(({ data }) => setStrategies(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const toggleStrategy = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateStrategy(id)
      } else {
        await activateStrategy(id)
      }
      setStrategies((prev) =>
        prev.map((s) => s.id === id ? { ...s, active: !s.active } : s)
      )
    } catch {
      // 에러 toast는 client.ts 인터셉터에서 처리
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteStrategy(deleteTarget.id)
      setDeleteTarget(null)
      fetchStrategies()
    } catch {
      // 에러 toast는 client.ts 인터셉터에서 처리
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChanged = (id: number, active: boolean) => {
    setStrategies((prev) => prev.map((s) => s.id === id ? { ...s, active } : s))
    setSelectedStrategy((prev) => prev?.id === id ? { ...prev, active } : prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Strategies</h2>
          <p className="text-muted-foreground mt-1">트레이딩 전략을 관리하세요</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          전략 추가
        </Button>
      </div>

      <CreateStrategyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={fetchStrategies}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전략 삭제</DialogTitle>
            <DialogDescription>
              전략을 삭제하면 진행 중인 포지션이 현재가로 강제 청산됩니다. 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StrategyDetailModal
        strategy={selectedStrategy}
        open={!!selectedStrategy}
        onOpenChange={(open) => { if (!open) setSelectedStrategy(null) }}
        onStatusChanged={handleStatusChanged}
      />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">전체 전략</CardTitle>
          <CardDescription>
            {strategies.filter((s) => s.active).length}개 활성 / 전체 {strategies.length}개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">이름</TableHead>
                <TableHead className="text-muted-foreground">상태</TableHead>
                <TableHead className="text-muted-foreground">거래소</TableHead>
                <TableHead className="text-muted-foreground">마켓</TableHead>
                <TableHead className="text-muted-foreground">매수 금액</TableHead>
                <TableHead className="text-muted-foreground text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{strategy.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`h-2 w-2 fill-current ${
                          strategy.active ? 'text-success' : 'text-muted-foreground'
                        }`}
                      />
                      <span className={strategy.active ? 'text-success' : 'text-muted-foreground'}>
                        {strategy.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{strategy.exchange}</TableCell>
                  <TableCell className="text-foreground font-mono">{strategy.market}</TableCell>
                  <TableCell className="text-foreground font-mono">{strategy.buyAmount.toLocaleString()} KRW</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Button>
                      <Button
                        variant={strategy.active ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => toggleStrategy(strategy.id, strategy.active)}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(strategy)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {strategies.length === 0 && (
            <p className="text-center text-muted-foreground py-8">전략이 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}