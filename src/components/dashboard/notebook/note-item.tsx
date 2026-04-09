import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Note } from './notebook'
import { Heart, ThumbsUp, Smile, Frown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormattedText } from './formatted-text'

interface User {
  id: string
  name: string
}

interface NoteItemProps {
  note: Note
  users: User[]
  onReactionUpdate: () => void
  currentUser: string
  onOpen: () => void
}

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500', emoji: '👍' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500', emoji: '❤️' },
  { type: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500', emoji: '😂' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-purple-500', emoji: '😢' },
]

export function NoteItem({ note, users, onReactionUpdate, currentUser, onOpen }: NoteItemProps) {
  const [isReacting, setIsReacting] = useState(false)

  const handleReaction = async (e: React.MouseEvent, type: string) => {
    e.stopPropagation() // Prevent opening modal
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
    <Card
      className="border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full hover:scale-[1.02] duration-200"
      onClick={onOpen}
    >
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Avatar className="h-8 w-8 border-2 border-pink-100 mt-1">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.user.name}`} />
          <AvatarFallback className="bg-pink-100 text-pink-700">{note.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-pink-900 group-hover:text-pink-600 transition-colors">{note.user.name}</span>
            {note.emoji && (
               <span className="text-xl" title="Mood">{note.emoji}</span>
            )}
          </div>
          <span className="text-xs text-pink-400">
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <div className="line-clamp-3">
          <FormattedText
             text={note.content}
             className="text-pink-800 text-sm leading-relaxed opacity-90"
          />
        </div>
        <div className="mt-2 text-xs text-pink-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read more...
        </div>
      </CardContent>

      <CardFooter className="p-2 bg-pink-50/30 flex justify-between items-center rounded-b-xl border-t border-pink-50">
          <div className="flex gap-1 items-center">
            {REACTION_TYPES.map(({ type, icon: Icon, color }) => {
              const isActive = userReaction?.type === type
              const count = reactionsByType[type] || 0

              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1 h-7 px-1.5 hover:bg-white/80 relative transition-all",
                    isActive && "bg-white shadow-sm ring-1 ring-pink-100"
                  )}
                  onClick={(e) => handleReaction(e, type)}
                  disabled={isReacting || !currentUser}
                >
                  <Icon className={cn("h-3.5 w-3.5 transition-all", isActive ? `${color} fill-current` : "text-slate-400")} />
                  {count > 0 && <span className="text-[10px] font-medium text-slate-600">{count}</span>}
                </Button>
              )
            })}
          </div>

          <div className="flex items-center gap-1 text-pink-400 pr-2">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="text-xs">{note.comments.length}</span>
          </div>
      </CardFooter>
    </Card>
  )
}
