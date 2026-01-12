import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'

interface Comment {
  id: number
  content: string
  createdAt: string
  user: { name: string }
}

interface CommentSectionProps {
  noteId: number
  comments: Comment[]
  currentUser: string | null
  onCommentAdded: () => void
}

export function CommentSection({ noteId, comments, currentUser, onCommentAdded }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  return (
    <div className="mt-4 pt-4 border-t border-pink-100">
      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-200">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 items-start">
            <Avatar className="h-6 w-6 border border-pink-100 mt-1">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
              <AvatarFallback className="text-[10px]">{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-pink-50/50 rounded-lg p-2 text-sm flex-1">
              <span className="font-semibold text-pink-900 block text-xs mb-0.5">{comment.user.name}</span>
              <p className="text-pink-800 break-words">{comment.content}</p>
            </div>
          </div>
        ))}
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
