import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Heart, ThumbsUp } from 'lucide-react'
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
  parentId?: number | null
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
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userName: currentUser, parentId: replyingTo }),
      })

      if (response.ok) {
        setContent('')
        setReplyingTo(null)
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
        body: JSON.stringify({ userName: currentUser, type: 'love' }),
      })
      onCommentAdded()
    } catch (error) {
      console.error('Failed to react to comment', error)
    } finally {
      setReactingCommentId(null)
    }
  }

  // Group comments into root comments and replies
  const rootComments = comments.filter(c => !c.parentId)
  const repliesByParentId = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) acc[comment.parentId] = []
      acc[comment.parentId].push(comment)
    }
    return acc
  }, {} as Record<number, Comment[]>)

  const renderComment = (comment: Comment, isReply = false) => {
    const reactionsCount = comment.reactions?.length || 0
    const hasReacted = comment.reactions?.some(r => r.user.name === currentUser)
    const replies = repliesByParentId[comment.id] || []

    return (
      <div key={comment.id} className={cn("flex flex-col gap-2", isReply ? "mt-3" : "mt-4")}>
        <div className="flex gap-3 items-start group animate-in slide-in-from-bottom-2 duration-300">
          <Avatar className={cn("border border-pink-100 mt-0.5", isReply ? "h-6 w-6" : "h-8 w-8")}>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
            <AvatarFallback className="text-xs bg-pink-50 text-pink-700">{comment.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 max-w-[85%]">
            <div className="bg-white border border-pink-100 rounded-2xl rounded-tl-none p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-pink-900">{comment.user.name}</span>
                {/* Timestamp could go here if available */}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
            </div>

            {/* Reaction Action Row */}
            <div className="flex items-center gap-4 mt-1 ml-2">
              <button
                onClick={() => handleReaction(comment.id)}
                disabled={!currentUser || reactingCommentId === comment.id}
                className={cn(
                  "text-xs font-medium flex items-center gap-1.5 transition-colors duration-200",
                  hasReacted ? "text-pink-600" : "text-gray-500 hover:text-pink-500"
                )}
              >
                 <Heart className={cn("h-3.5 w-3.5", hasReacted ? "fill-current" : "")} />
                 {hasReacted ? 'Liked' : 'Like'}
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs font-medium text-gray-500 hover:text-pink-500 transition-colors duration-200"
                >
                  Reply
                </button>
              )}

              {reactionsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full">
                   <Heart className="h-3 w-3 fill-pink-500" />
                   <span className="font-semibold">{reactionsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render Replies */}
        {replies.length > 0 && (
          <div className="ml-11 border-l-2 border-pink-50 pl-4">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-pink-100">
      {/* Comments List */}
      <div className="space-y-1 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200">
        {rootComments.map(c => renderComment(c))}

        {comments.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm italic">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

      {/* Input Form */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative mt-4 pt-2 border-t border-pink-50">
          {replyingTo && (
            <div className="text-xs text-pink-600 flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-md w-fit">
              Replying to comment
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="hover:text-red-500 ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}
          <div className="relative flex items-center gap-2 w-full">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : `Write a comment as ${currentUser}...`}
            className="pr-10 h-10 text-sm bg-white border-pink-200 focus-visible:ring-pink-300 rounded-full pl-4 shadow-sm"
          />
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || isSubmitting}
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-pink-500 hover:bg-pink-600 shadow-sm transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
