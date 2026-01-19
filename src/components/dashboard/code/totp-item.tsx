import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Clock } from 'lucide-react'
import { TOTP } from 'otpauth'

interface TotpItemProps {
  id: number
  label: string
  secret: string
  issuer?: string | null
}

export function TotpItem({ label, secret, issuer }: TotpItemProps) {
  const [code, setCode] = useState('000000')
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const totp = new TOTP({
      issuer: issuer || 'App',
      label: label,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    })

    const update = () => {
      setCode(totp.generate())
      const epoch = Math.floor(Date.now() / 1000)
      const period = 30
      const remaining = period - (epoch % period)
      setTimeLeft(remaining)
      setProgress((remaining / period) * 100)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [label, secret, issuer])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format code with space (e.g. 123 456)
  const formattedCode = code.match(/.{1,3}/g)?.join(' ') || code

  return (
    <Card className="border-pink-100 bg-white/80 hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 flex justify-between items-center relative">
        {/* Progress Background (Subtle) */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-pink-500 transition-all duration-1000 ease-linear opacity-20"
          style={{ width: `${progress}%` }}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-pink-900">{issuer || 'Service'}</span>
            <span className="text-xs text-pink-400 bg-pink-50 px-1.5 rounded">{label}</span>
          </div>
          <div className="text-3xl font-mono font-bold text-pink-700 tracking-wider">
            {formattedCode}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="relative h-8 w-8 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="transparent"
                  stroke="#fce7f3"
                  strokeWidth="3"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="transparent"
                  stroke={timeLeft < 5 ? "#ef4444" : "#ec4899"}
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * progress) / 100}
                  className="transition-all duration-1000 ease-linear"
                />
             </svg>
             <span className={`absolute text-[10px] font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-pink-600'}`}>
               {timeLeft}
             </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-50"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
