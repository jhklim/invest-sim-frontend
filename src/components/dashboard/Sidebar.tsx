import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, LineChart, TrendingUp, List, Wallet } from 'lucide-react'
import { getMyInfo, type MemberResponse } from '@/api/member'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/strategies', label: 'Strategies', icon: LineChart },
  { href: '/dashboard/trades', label: 'Trades', icon: List },
]

export function Sidebar() {
  const location = useLocation()
  const [member, setMember] = useState<MemberResponse | null>(null)

  useEffect(() => {
    getMyInfo().then(({ data }) => setMember(data))

    const interval = setInterval(() => {
      getMyInfo().then(({ data }) => setMember(data))
    }, 10_000)

    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/10">
            <TrendingUp className="h-6 w-6 text-sidebar-primary" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">InvestSim</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* 자산 현황 카드 */}
        <div className="rounded-lg bg-sidebar-accent/50 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-sidebar-primary shrink-0" />
            <span className="text-xs text-sidebar-foreground/50">총 평가자산</span>
          </div>
          <p className="text-base font-bold text-sidebar-foreground">
            {member ? `${member.totalAsset.toLocaleString('ko-KR')}원` : '-'}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sidebar-border">
            <div>
              <p className="text-[10px] text-sidebar-foreground/40">주문가능</p>
              <p className="text-xs font-medium text-sidebar-primary">
                {member ? `${member.availableBalance.toLocaleString('ko-KR')}원` : '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-sidebar-foreground/40">예약금</p>
              <p className="text-xs font-medium text-sidebar-foreground/70">
                {member ? `${member.reservedAmount.toLocaleString('ko-KR')}원` : '-'}
              </p>
            </div>
          </div>
          <div className="pt-1 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-foreground/40">보유 포지션</p>
            <p className="text-xs font-medium text-sidebar-foreground/70">
              {member ? `${member.openPositionValue.toLocaleString('ko-KR')}원` : '-'}
            </p>
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Simulation Mode
        </p>
      </div>
    </aside>
  )
}