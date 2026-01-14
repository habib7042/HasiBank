import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Keypad } from '@/components/ui/keypad'
import { Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PinGateProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function PinGate({ children, title = "Security Check", description = "Enter PIN to access this section" }: PinGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const verifyPin = async (code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      })

      if (response.ok) {
        setIsUnlocked(true)
        toast({
          title: "Access Granted",
          description: "Welcome back! 🔓",
        })
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect PIN. Please try again.",
          variant: "destructive",
        })
        setPin('')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      })
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-verify when PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      verifyPin(pin)
    }
  }, [pin])

  const handleKeyPress = (key: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + key)
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
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
          <div className="flex justify-center">
            <Input
              type="password"
              value={pin}
              readOnly
              className="text-center text-2xl tracking-[1em] font-bold w-48 border-pink-200 focus:ring-pink-400 bg-white cursor-default"
              maxLength={4}
            />
          </div>

          <div className="bg-white/50 p-4 rounded-xl border border-pink-100">
            <Keypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              currentLength={pin.length}
            />
          </div>

          <div className="h-4"></div> {/* Spacer */}
        </CardContent>
      </Card>
    </div>
  )
}
