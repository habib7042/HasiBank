import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Note } from './notebook'
import { Heart, ThumbsUp, Smile, Frown, MessageCircle, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CommentSection } from './comment-section'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface User {
  id: string
  name: string
}

interface NoteItemProps {
  note: Note
  users: User[]
  onReactionUpdate: () => void
}

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500', emoji: '👍' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500', emoji: '❤️' },
  { type: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500', emoji: '😂' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-purple-500', emoji: '😢' },
]

interface FloatingEmoji {
  id: number
  emoji: string
}

export function NoteItem({ note, users, onReactionUpdate }: NoteItemProps) {
  const [isReacting, setIsReacting] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [showComments, setShowComments] = useState(false)

  // Try to persist/guess the user identity locally if possible, or just default to first available
  // ideally this should be shared state but for now local is okay for simple interactions
  const [reactingUser, setReactingUser] = useState<string>(users.length > 0 ? users[0].name : '')

  const handleReaction = async (type: string, emoji: string) => {
    if (!reactingUser) return

    // Trigger animation
    const id = Date.now()
    setFloatingEmojis(prev => [
      ...prev,
      { id, emoji },
      { id: id + 1, emoji },
      { id: id + 2, emoji }
    ])

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id < id))
    }, 2000)

    setIsReacting(true)
    try {
      await fetch(`/api/notes/${note.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: reactingUser, type }),
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

  const userReaction = note.reactions.find(r => r.user.name === reactingUser)

  return (
    <Card className="border-pink-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow relative overflow-visible flex flex-col h-full">
       {/* Floating Emojis Container */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {floatingEmojis.map((e, index) => (
          <div
            key={e.id}
            className="absolute bottom-12 left-1/2 text-4xl animate-float-up-sway z-50"
            style={{
              animationDelay: `${index * 0.2}s`,
              left: `${50 + (Math.random() * 20 - 10)}%`
            }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Avatar className="h-8 w-8 border-2 border-pink-100 mt-1">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.user.name}`} />
          <AvatarFallback className="bg-pink-100 text-pink-700">{note.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-pink-900">{note.user.name}</span>
            {note.emoji && (
              <span className="text-2xl animate-pulse" title="Mood">{note.emoji}</span>
            )}
          </div>
          <span className="text-xs text-pink-400">
            {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-pink-800 whitespace-pre-wrap">{note.content}</p>
      </CardContent>

      <CardFooter className="p-2 bg-pink-50/50 flex flex-col gap-2 rounded-b-xl">
        <div className="flex w-full justify-between items-center px-2">
          {/* Reaction Buttons */}
          <div className="flex gap-1 items-center">
            {REACTION_TYPES.map(({ type, icon: Icon, color, emoji }) => {
              const isActive = userReaction?.type === type
              const count = reactionsByType[type] || 0

              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1 h-8 px-2 hover:bg-white/50 relative",
                    isActive && "bg-white shadow-sm ring-1 ring-pink-100"
                  )}
                  onClick={() => handleReaction(type, emoji)}
                  disabled={isReacting || !reactingUser}
                >
                  <Icon className={cn("h-4 w-4 transition-all", isActive ? `${color} fill-current scale-110` : "text-slate-400")} />
                  {count > 0 && <span className="text-xs font-medium text-slate-600">{count}</span>}
                </Button>
              )
            })}

            {/* Identity Switcher for Reactions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-pink-400 hover:text-pink-600">
                  <UserIcon className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="start">
                <div className="text-xs font-medium text-pink-500 mb-2">Reacting as:</div>
                <div className="flex flex-col gap-1">
                  {users.map((u) => (
                    <Button
                      key={u.id}
                      variant={reactingUser === u.name ? "secondary" : "ghost"}
                      size="sm"
                      className="justify-start h-7 text-xs"
                      onClick={() => setReactingUser(u.name)}
                    >
                      {u.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn("text-pink-600 hover:text-pink-800 hover:bg-pink-100/50 gap-1", showComments && "bg-pink-100/50")}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{note.comments.length}</span>
          </Button>
        </div>

        {showComments && (
          <CommentSection
            noteId={note.id}
            comments={note.comments}
            currentUser={reactingUser} // Pass the locally selected user
            onCommentAdded={onReactionUpdate}
          />
        )}
      </CardFooter>
    </Card>
  )
}
