import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCheck } from 'lucide-react'

interface User {
  id: string
  name: string
}

interface IdentityGateProps {
  users: User[]
  children: (user: string) => React.ReactNode
  gateId: string
  title?: string
}

export function IdentityGate({ users, children, gateId, title = "Who are you?" }: IdentityGateProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = sessionStorage.getItem(`identity_${gateId}`)
    if (savedUser) {
      setSelectedUser(savedUser)
    }
  }, [gateId])

  const handleSelect = (name: string) => {
    setSelectedUser(name)
    sessionStorage.setItem(`identity_${gateId}`, name)
  }

  if (selectedUser) {
    return <>{children(selectedUser)}</>
  }

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md border-pink-100 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-pink-100 p-3 rounded-full w-fit mb-4">
            <UserCheck className="h-8 w-8 text-pink-500" />
          </div>
          <CardTitle className="text-pink-800">{title}</CardTitle>
          <CardDescription className="text-pink-600">Select your identity to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="h-auto flex flex-col gap-3 p-6 hover:scale-105 transition-all border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
              onClick={() => handleSelect(user.name)}
            >
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-bold text-pink-900">{user.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
