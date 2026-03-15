import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { TrendingUp } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    setIsLoading(true)

    const result = await signup(email, password, nickname)

    if (result.success) {
      navigate('/login')
    } else {
      setError(result.error || '회원가입에 실패했습니다')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">InvestSim</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              새 계정을 만들어 시뮬레이션을 시작하세요
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">이메일</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nickname">닉네임</FieldLabel>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="passwordConfirm">비밀번호 확인</FieldLabel>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </Field>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}