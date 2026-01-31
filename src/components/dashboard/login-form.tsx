import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, Landmark } from 'lucide-react'
import { Keypad } from '@/components/ui/keypad'

interface LoginFormProps {
  onLogin: (pin: string) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')

  const attemptLogin = async (code: string) => {
    setStatus('verifying')
    try {
      await onLogin(code)
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

  useEffect(() => {
    if (!isLoading && status === 'verifying' && pin.length === 4) {
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
    <div className="flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-md">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200 border border-slate-100">
              <Landmark className="h-12 w-12 text-slate-700" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hashi Bank</h1>
          <p className="text-slate-500 font-medium">Secure Banking Portal</p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl text-center text-slate-800">Identity Verification</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Please enter your security PIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <Input
                  type="password"
                  value={pin}
                  readOnly
                  className={`text-center text-2xl tracking-[1em] font-bold w-48 border-slate-200 bg-slate-50 cursor-default transition-all duration-300 shadow-inner ${
                    status === 'error' ? 'border-red-400 ring-2 ring-red-100 animate-shake' :
                    status === 'success' ? 'border-emerald-500 ring-2 ring-emerald-100' :
                    'focus:ring-slate-300'
                  }`}
                  maxLength={4}
                />

                <div className="h-6 flex items-center justify-center text-sm font-medium">
                  {(status === 'verifying' || isLoading) ? (
                    <span className="text-slate-600 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                    </span>
                  ) : status === 'success' ? (
                    <span className="text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Access Granted
                    </span>
                  ) : status === 'error' ? (
                    <span className="text-red-500 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Invalid PIN
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <Keypad
                  onKeyPress={handleKeyPress}
                  onDelete={handleDelete}
                  currentLength={pin.length}
                  variant="professional"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
