import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Phone, MessageCircle, User, Search, Loader2, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Contact {
  id: number
  name: string
  number: string
  isActive: boolean
}

interface ContactBookProps {
  currentUser: string | null
}

export function ContactBook({ currentUser }: ContactBookProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newIsActive, setNewIsActive] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const loadContacts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to load contacts', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newNumber) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          number: newNumber,
          isActive: newIsActive,
          userName: currentUser || 'System' // Default to System if no user, backend handles lookup
        }),
      })

      if (response.ok) {
        toast({
          title: "Contact Saved",
          description: `${newName} has been added to your contacts.`,
        })
        setNewName('')
        setNewNumber('')
        setNewIsActive(true)
        loadContacts()
      } else {
        throw new Error('Failed to add contact')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAdding(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.number.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <Card className="border-pink-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-pink-800 flex items-center gap-2">
            <User className="h-5 w-5" /> Add New Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-pink-700">Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mom"
                  className="bg-white/50 border-pink-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-pink-700">Mobile Number</Label>
                <Input
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. +88017..."
                  className="bg-white/50 border-pink-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active-mode"
                checked={newIsActive}
                onCheckedChange={setNewIsActive}
                className="data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="active-mode" className="text-pink-700">Active Status (Green Icon)</Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={isAdding || !newName || !newNumber}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Contact"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="pl-9 bg-white/50 border-pink-200"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Static WhatsApp Support Card */}
        <Card className="border-green-100 bg-green-50/50 hover:shadow-md transition-all cursor-pointer group" onClick={() => window.open('https://wa.me/8801893669791', '_blank')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 border border-green-200">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Support / Admin</h3>
                <p className="text-sm text-green-700">+8801893669791</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-green-600 hover:bg-green-100 rounded-full">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Static Quick Chat (Tawk.to) Card */}
        <Card className="border-blue-100 bg-blue-50/50 hover:shadow-md transition-all cursor-pointer group" onClick={() => window.open('https://tawk.to/chat/69d14f099680621c337898ca/1jlcppg74?', '_blank')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Quick Chat</h3>
                <p className="text-sm text-blue-700">Live conversation</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-100 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="border-pink-100 bg-white/80 hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={`h-10 w-10 border-2 ${contact.isActive ? 'border-green-400' : 'border-gray-200'}`}>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-pink-900">{contact.name}</h3>
                    {contact.isActive && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Active" />
                    )}
                  </div>
                  <p className="text-sm text-pink-600">{contact.number}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-full"
                onClick={() => window.open(`tel:${contact.number}`)}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
