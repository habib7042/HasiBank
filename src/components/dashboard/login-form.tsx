import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Heart } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg shadow-pink-200">
              <Heart className="h-12 w-12 text-pink-500 fill-pink-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-pink-900 drop-shadow-sm">Hashi Bank</h1>
          <p className="text-pink-700 font-medium">Banking with Love 💖</p>
        </div>

        <Card className="border-pink-100 shadow-xl shadow-pink-100/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-pink-800">Welcome Back!</CardTitle>
            <CardDescription className="text-center text-pink-600">
              Enter your PIN to access your savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-pink-700">Security PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  autoComplete="off"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center text-2xl tracking-widest border-pink-200 focus-visible:ring-pink-400 text-pink-800 placeholder:text-pink-300 bg-white/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-200"
                disabled={isLoading || pin.length < 4}
              >
                {isLoading ? "Verifying..." : "Open My Vault 💝"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
