import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteInput } from './note-input'
import { NoteList } from './note-list'
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

interface Comment {
  id: number
  content: string
  createdAt: string
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
  comments: Comment[]
}

interface NotebookProps {
  users: User[]
}

export function Notebook({ users }: NotebookProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <div className="space-y-6">
      <Card className="border-pink-100 bg-white/70 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle className="text-pink-800 flex items-center gap-2">
             KothaBank <BookHeart className="h-5 w-5 text-pink-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NoteInput
            users={users}
            onNoteCreated={handleNoteCreated}
          />
        </CardContent>
      </Card>

      <NoteList
        notes={notes}
        onReactionUpdate={handleReactionUpdate}
        users={users}
      />
    </div>
  )
}
