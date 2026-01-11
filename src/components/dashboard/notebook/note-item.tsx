import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Note } from './notebook'
import { Heart, ThumbsUp, Smile, Frown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NoteItemProps {
  note: Note
  currentUser: string | null
  onReactionUpdate: () => void
}

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-purple-500' },
]

export function NoteItem({ note, currentUser, onReactionUpdate }: NoteItemProps) {
  const [isReacting, setIsReacting] = useState(false)

  const handleReaction = async (type: string) => {
    if (!currentUser) return

    setIsReacting(true)
    try {
      await fetch(`/api/notes/${note.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser, type }),
      })
      onReactionUpdate()
    } catch (error) {
      console.error('Failed to react', error)
    } finally {
      setIsReacting(false)
    }
  }

  // Group reactions by type
  const reactionsByType = note.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const userReaction = note.reactions.find(r => r.user.name === currentUser)

  return (
    <Card className="border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <Avatar className="h-8 w-8 border-2 border-pink-100">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.user.name}`} />
          <AvatarFallback className="bg-pink-100 text-pink-700">{note.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-pink-900">{note.user.name}</span>
          <span className="text-xs text-pink-400">
            {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-pink-800 whitespace-pre-wrap">{note.content}</p>
      </CardContent>
      <CardFooter className="p-2 bg-pink-50/50 flex flex-col gap-2 rounded-b-xl">
        <div className="flex w-full justify-around">
          {REACTION_TYPES.map(({ type, icon: Icon, color }) => {
            const isActive = userReaction?.type === type
            const count = reactionsByType[type] || 0

            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 h-8 px-2 hover:bg-white/50",
                  isActive && "bg-white shadow-sm ring-1 ring-pink-100"
                )}
                onClick={() => handleReaction(type)}
                disabled={isReacting || !currentUser}
              >
                <Icon className={cn("h-4 w-4 transition-all", isActive ? `${color} fill-current scale-110` : "text-slate-400")} />
                {count > 0 && <span className="text-xs font-medium text-slate-600">{count}</span>}
              </Button>
            )
          })}
        </div>
      </CardFooter>
    </Card>
  )
}
