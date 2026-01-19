import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, QrCode, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface AddTotpFormProps {
  currentUser: string | null
  onSuccess: () => void
}

export function AddTotpForm({ currentUser, onSuccess }: AddTotpFormProps) {
  const [label, setLabel] = useState('')
  const [secret, setSecret] = useState('')
  const [issuer, setIssuer] = useState('Facebook')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      )

      scanner.render((decodedText) => {
        handleScan(decodedText)
        scanner.clear()
        setShowScanner(false)
      }, (error) => {
        // console.warn(error)
      })

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [showScanner])

  const handleScan = (data: string) => {
    try {
      const url = new URL(data)
      if (url.protocol === 'otpauth:') {
        const path = decodeURIComponent(url.pathname.replace('//totp/', ''))
        const secretParam = url.searchParams.get('secret')
        const issuerParam = url.searchParams.get('issuer')

        if (secretParam) setSecret(secretParam)
        if (issuerParam) setIssuer(issuerParam)

        // Parse label (Account)
        const parts = path.split(':')
        if (parts.length > 1) {
           setLabel(parts[1])
           if (!issuerParam) setIssuer(parts[0])
        } else {
           setLabel(path)
        }

        toast({
          title: "QR Code Scanned",
          description: "Secret and details captured successfully.",
        })
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This does not look like a valid authentication QR code.",
          variant: "destructive"
        })
      }
    } catch (e) {
      console.error(e)
      toast({
        title: "Scan Error",
        description: "Could not parse the QR code data.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !secret) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          secret,
          issuer,
          userName: currentUser
        }),
      })

      if (response.ok) {
        toast({
          title: "Code Added",
          description: "New authenticator code added successfully.",
        })
        setLabel('')
        setSecret('')
        onSuccess()
      } else {
        throw new Error('Failed to add code')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add code. Check if the secret is valid.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-pink-100 bg-white/70 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="text-pink-800 text-lg flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Code</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowScanner(!showScanner)}
            className="text-pink-600 border-pink-200 hover:bg-pink-50"
          >
            {showScanner ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4 mr-2" />}
            {showScanner ? 'Cancel Scan' : 'Scan QR'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showScanner && (
          <div className="mb-6 border-2 border-dashed border-pink-300 rounded-xl overflow-hidden bg-black/5">
            <div id="reader" className="w-full"></div>
            <p className="text-center text-xs text-pink-500 p-2">Point camera at the QR code</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-pink-700">Service (Issuer)</Label>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Facebook"
                className="bg-white/50 border-pink-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-pink-700">Account Name (Label)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. johndoe@email.com"
                className="bg-white/50 border-pink-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-pink-700">Secret Key</Label>
              <Input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Base32 Key"
                className="bg-white/50 border-pink-200 font-mono"
                required
                autoComplete="off"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={isSubmitting || !secret || !label}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Authenticator"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
