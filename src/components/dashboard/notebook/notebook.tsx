import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteInput } from './note-input'
import { NoteList } from './note-list'
import { BookHeart, Filter, Loader2, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  currentUser: string
}

export function Notebook({ users, currentUser }: NotebookProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Filters
  const [filterUser, setFilterUser] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadNotes = async (reset = false) => {
    setIsLoading(true)
    try {
      const currentPage = reset ? 1 : page
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (filterUser && filterUser !== 'all') queryParams.append('filterUser', filterUser)
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)

      const response = await fetch(`/api/notes?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          setNotes(data.notes)
        } else {
          setNotes(prev => [...prev, ...data.notes])
        }

        setHasMore(data.pagination.currentPage < data.pagination.pages)
        setPage(currentPage + 1)
      }
    } catch (error) {
      console.error('Failed to load notes', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotes(true)
  }, [filterUser, startDate, endDate])

  const handleNoteCreated = () => {
    loadNotes(true)
  }

  const handleReactionUpdate = () => {
    loadNotes(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-pink-100 bg-white/70 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-pink-800 flex items-center gap-2">
             KothaBank <BookHeart className="h-5 w-5 text-pink-500" />
          </CardTitle>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-pink-700 border-pink-200">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-pink-700 text-xs">Filter by User</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-pink-700 text-xs">Start Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-pink-700 text-xs">End Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-pink-500 hover:text-pink-700"
                  onClick={() => {
                    setFilterUser('all')
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <NoteInput
            users={users}
            onNoteCreated={handleNoteCreated}
            currentUser={currentUser}
          />
        </CardContent>
      </Card>

      <NoteList
        notes={notes}
        onReactionUpdate={handleReactionUpdate}
        users={users}
        currentUser={currentUser}
      />

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => loadNotes(false)}
            disabled={isLoading}
            className="text-pink-600 border-pink-200 hover:bg-pink-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? 'Loading...' : 'Load More Notes'}
          </Button>
        </div>
      )}
    </div>
  )
}
