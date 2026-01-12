import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteInput } from './note-input'
import { NoteList } from './note-list'
import { UserSelector } from './user-selector'
import { BookHeart } from 'lucide-react'

interface User {
  id: string
  name: string
}

interface Reaction {
  id: number
  type: string
  userId: number
  user: { name: string }
}

export interface Note {
  id: number
  content: string
  emoji: string | null
  userId: number
  createdAt: string
  user: { name: string }
  reactions: Reaction[]
}

interface NotebookProps {
  currentUser: string | null
  users: User[]
}

export function Notebook({ currentUser: initialUser, users }: NotebookProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actingUser, setActingUser] = useState<string | null>(initialUser)
  const [showUserSelector, setShowUserSelector] = useState(false)

  // If no user is selected initially, show the selector
  useEffect(() => {
    if (!actingUser) {
      setShowUserSelector(true)
    }
  }, [actingUser])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Failed to load notes', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleNoteCreated = () => {
    loadNotes()
  }

  const handleReactionUpdate = () => {
    loadNotes()
  }

  const handleUserSelect = (userName: string) => {
    setActingUser(userName)
    setShowUserSelector(false)
  }

  return (
    <div className="space-y-6">
      <UserSelector
        isOpen={showUserSelector}
        onSelect={handleUserSelect}
      />

      <Card className="border-pink-100 bg-white/70 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle className="text-pink-800 flex items-center gap-2">
             Community Notebook <BookHeart className="h-5 w-5 text-pink-500" />
          </CardTitle>
          {actingUser && (
            <div className="ml-auto text-sm text-pink-600">
              Acting as: <span className="font-bold">{actingUser}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <NoteInput
            currentUser={actingUser}
            users={users}
            onNoteCreated={handleNoteCreated}
          />
        </CardContent>
      </Card>

      <NoteList
        notes={notes}
        currentUser={actingUser}
        onReactionUpdate={handleReactionUpdate}
      />
    </div>
  )
}
