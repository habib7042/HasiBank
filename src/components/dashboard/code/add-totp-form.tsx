import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AddTotpFormProps {
  currentUser: string | null
  onSuccess: () => void
}

export function AddTotpForm({ currentUser, onSuccess }: AddTotpFormProps) {
  const [label, setLabel] = useState('')
  const [secret, setSecret] = useState('')
  const [issuer, setIssuer] = useState('Facebook')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !secret || !currentUser) return

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
        <CardTitle className="text-pink-800 text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add New Code
        </CardTitle>
      </CardHeader>
      <CardContent>
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
