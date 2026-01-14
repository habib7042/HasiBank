import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Keypad } from '@/components/ui/keypad'
import { Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PinGateProps {
  children: React.ReactNode
  title?: string
  description?: string
  gateId?: string
}

export function PinGate({ children, title = "Security Check", description = "Enter PIN to access this section", gateId }: PinGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const { toast } = useToast()

  useEffect(() => {
    if (gateId) {
      const unlocked = sessionStorage.getItem(`gate_unlocked_${gateId}`)
      if (unlocked === 'true') {
        setIsUnlocked(true)
      }
    }
  }, [gateId])

  const verifyPin = async (code: string) => {
    setStatus('verifying')
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      })

      if (response.ok) {
        setStatus('success')
        setTimeout(() => {
          setIsUnlocked(true)
          if (gateId) {
            sessionStorage.setItem(`gate_unlocked_${gateId}`, 'true')
          }
          toast({
            title: "Access Granted",
            description: "Welcome back! 🔓",
          })
        }, 500)
      } else {
        setStatus('error')
        toast({
          title: "Access Denied",
          description: "Incorrect PIN. Please try again.",
          variant: "destructive",
        })
        setTimeout(() => {
          setPin('')
          setStatus('idle')
        }, 1000)
      }
    } catch (error) {
      setStatus('error')
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      })
      setTimeout(() => {
        setPin('')
        setStatus('idle')
      }, 1000)
    }
  }

  // Auto-verify when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      verifyPin(pin)
    }
  }, [pin])

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

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md border-pink-100 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-pink-100 p-3 rounded-full w-fit mb-4">
            <Lock className="h-8 w-8 text-pink-500" />
          </div>
          <CardTitle className="text-pink-800">{title}</CardTitle>
          <CardDescription className="text-pink-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              {status === 'verifying' && (
                <span className="text-pink-600 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              )}
              {status === 'success' && (
                <span className="text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Access Granted
                </span>
              )}
              {status === 'error' && (
                <span className="text-red-500 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Incorrect PIN
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/50 p-4 rounded-xl border border-pink-100">
            <Keypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              currentLength={pin.length}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
