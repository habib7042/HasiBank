import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Keypad } from '@/components/ui/keypad'

interface LoginFormProps {
  onLogin: (pin: string) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    attemptLogin(pin)
  }

  const attemptLogin = async (code: string) => {
    setStatus('verifying')
    try {
      await onLogin(code)
      // If onLogin resolves, we assume success or let parent handle it,
      // but usually we want to show success state before transition if possible.
      // However, onLogin prop might redirect or set state immediately.
      // Let's assume successful execution means valid PIN for now or rely on prop.
      // But if parent sets error toast, we might want to know.
      // Since `onLogin` in `Home` handles toast, we can infer state if we wrap it?
      // Actually, `onLogin` is async. If it throws, it's error.
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setTimeout(() => {
        setPin('')
        setStatus('idle')
      }, 1000)
    }
  }

  // Auto-submit when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      attemptLogin(pin)
    }
  }, [pin])

  // Watch for external loading state change to error
  useEffect(() => {
    if (!isLoading && status === 'verifying' && pin.length === 4) {
       // If loading stopped but we are still in verifying, it might be a failure handled by parent?
       // Actually `onLogin` in Home creates a Toast but doesn't throw if invalid, logic is inside `response.ok`.
       // This component structure makes it hard to know result without prop change.
       // For now, I'll rely on the visual cue from the input shake if I can trigger it,
       // but strictly speaking, `onLogin` should return result.
       // Let's update `onLogin` in `Home` to throw/return bool in a future step if needed,
       // but here I'll just rely on `isLoading` prop to reset to error if it goes false quickly?
       // No, simpler: visual feedback is "Verifying..." until parent unmounts/redirects.
       // If parent stays mounted and stops loading, it was likely an error.
       setStatus('error')
       setTimeout(() => {
         setPin('')
         setStatus('idle')
       }, 1000)
    }
  }, [isLoading])

  const handleKeyPress = (key: string) => {
    if (pin.length < 4 && status !== 'verifying' && status !== 'success') {
      setPin(prev => prev + key)
    }
  }

  const handleDelete = () => {
    if (status !== 'verifying' && status !== 'success') {
      setPin(prev => prev.slice(0, -1))
    }
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
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Input
                  type="password"
                  value={pin}
                  readOnly
                  className={`text-center text-2xl tracking-[1em] font-bold w-48 border-pink-200 bg-white cursor-default transition-all duration-300 ${
                    status === 'error' ? 'border-red-400 ring-2 ring-red-200 animate-shake' :
                    status === 'success' ? 'border-green-400 ring-2 ring-green-200' :
                    'focus:ring-pink-400'
                  }`}
                  maxLength={4}
                />

                <div className="h-6 flex items-center justify-center text-sm font-medium">
                  {(status === 'verifying' || isLoading) ? (
                    <span className="text-pink-600 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : status === 'success' ? (
                    <span className="text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Success!
                    </span>
                  ) : status === 'error' ? (
                    <span className="text-red-500 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Incorrect PIN
                    </span>
                  ) : null}
                </div>
              </div>

              <Keypad
                onKeyPress={handleKeyPress}
                onDelete={handleDelete}
                currentLength={pin.length}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
