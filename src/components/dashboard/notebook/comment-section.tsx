import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentReaction {
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
  reactions?: CommentReaction[]
}

interface CommentSectionProps {
  noteId: number
  comments: Comment[]
  currentUser: string | null
  onCommentAdded: () => void // This refreshes the parent data, so it handles reaction updates too
}

export function CommentSection({ noteId, comments, currentUser, onCommentAdded }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userName: currentUser }),
      })

      if (response.ok) {
        setContent('')
        onCommentAdded()
      }
    } catch (error) {
      console.error('Failed to post comment', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReaction = async (commentId: number) => {
    if (!currentUser) return
    setReactingCommentId(commentId)

    try {
      await fetch(`/api/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser, type: 'love' }), // Defaulting to 'love' for comments
      })
      onCommentAdded()
    } catch (error) {
      console.error('Failed to react to comment', error)
    } finally {
      setReactingCommentId(null)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-pink-100">
      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-200">
        {comments.map((comment) => {
          const reactionsCount = comment.reactions?.length || 0
          const hasReacted = comment.reactions?.some(r => r.user.name === currentUser)

          return (
            <div key={comment.id} className="flex gap-2 items-start group">
              <Avatar className="h-6 w-6 border border-pink-100 mt-1">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
                <AvatarFallback className="text-[10px]">{comment.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-pink-50/50 rounded-lg p-2 text-sm relative">
                  <span className="font-semibold text-pink-900 block text-xs mb-0.5">{comment.user.name}</span>
                  <p className="text-pink-800 break-words">{comment.content}</p>

                  {/* Reaction Button (Absolute or flex) */}
                  <button
                    onClick={() => handleReaction(comment.id)}
                    disabled={!currentUser || reactingCommentId === comment.id}
                    className={cn(
                      "absolute -right-2 -bottom-2 bg-white border border-pink-100 rounded-full p-1 shadow-sm flex items-center gap-1 hover:bg-pink-50 transition-all",
                      (reactionsCount > 0 || hasReacted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Heart className={cn("h-3 w-3", hasReacted ? "fill-red-500 text-red-500" : "text-pink-300")} />
                    {reactionsCount > 0 && <span className="text-[10px] text-pink-600 font-bold">{reactionsCount}</span>}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Form */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="h-8 text-sm bg-white/50 border-pink-200 focus-visible:ring-pink-300"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="h-8 px-2 bg-pink-500 hover:bg-pink-600"
          >
            <Send className="h-3 w-3" />
          </Button>
        </form>
      )}
    </div>
  )
}
