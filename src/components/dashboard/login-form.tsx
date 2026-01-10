import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  onLogin: (pin: string) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [pin, setPin] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(pin)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hashi Bank</h1>
          <p className="text-slate-500">Secure Banking Portal</p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Enter Access PIN</CardTitle>
            <CardDescription className="text-center">
              Please enter your authorized PIN to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Security PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || pin.length < 4}
              >
                {isLoading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
