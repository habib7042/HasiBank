import { useState, useEffect } from 'react'
import { TotpItem } from './totp-item'
import { AddTotpForm } from './add-totp-form'
import { Loader2 } from 'lucide-react'

interface TotpSecret {
  id: number
  label: string
  secret: string
  issuer: string
}

interface CodePageProps {
  currentUser?: string | null
}

export function CodePage({ currentUser }: CodePageProps) {
  const [secrets, setSecrets] = useState<TotpSecret[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadSecrets = async () => {
    setIsLoading(true)
    try {
      // If currentUser is present, use it, otherwise fetch all (API defaults to all if no userName)
      const url = currentUser ? `/api/totp?userName=${currentUser}` : '/api/totp'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSecrets(data.secrets)
      }
    } catch (error) {
      console.error('Failed to load codes', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [currentUser])

  return (
    <div className="space-y-6">
      <AddTotpForm currentUser={currentUser || null} onSuccess={loadSecrets} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-12 text-pink-400">
          No codes yet. Add your first authenticator key! 🔐
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {secrets.map((secret) => (
            <TotpItem
              key={secret.id}
              id={secret.id}
              label={secret.label}
              secret={secret.secret}
              issuer={secret.issuer}
            />
          ))}
        </div>
      )}
    </div>
  )
}
