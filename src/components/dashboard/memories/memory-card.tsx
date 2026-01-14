import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, MessageCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemoryComment {
  id: number
  content: string
  createdAt: string
  user: { name: string }
}

interface MemoryImage {
  id: number
  url: string
}

interface Memory {
  id: number
  imageUrl: string | null
  description: string
  date: string
  user: { name: string }
  images: MemoryImage[]
  comments: MemoryComment[]
}

interface MemoryCardProps {
  memory: Memory
  currentUser: string | null
  onCommentAdded: () => void
}

export function MemoryCard({ memory, currentUser, onCommentAdded }: MemoryCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Combine legacy imageUrl with new images array for display
  const allImages = [
    ...(memory.images?.map(img => img.url) || []),
    ...(memory.imageUrl && !memory.images?.some(img => img.url === memory.imageUrl) ? [memory.imageUrl] : [])
  ]

  const displayImages = allImages.length > 0 ? allImages : ['/placeholder.png']

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleDownload = (imageUrl: string, description: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `memory-${description.slice(0, 20).replace(/\s+/g, '-')}-${currentImageIndex}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/memories/${memory.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, userName: currentUser }),
      })

      if (response.ok) {
        setComment('')
        onCommentAdded()
      }
    } catch (error) {
      console.error('Failed to comment', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden border-pink-100 bg-white/80 hover:shadow-lg transition-all group flex flex-col h-full">
      <div className="aspect-square relative overflow-hidden bg-gray-100 group-hover:shadow-inner">
        <img
          src={displayImages[currentImageIndex]}
          alt={memory.description}
          className="object-cover w-full h-full transition-transform duration-500"
        />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); handlePrevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleNextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className="bg-white/90 text-pink-700 hover:bg-white border-none shadow-sm">
            {new Date(memory.date).toLocaleDateString()}
          </Badge>
        </div>

        {/* Download Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white text-pink-700 pointer-events-auto"
            onClick={() => handleDownload(displayImages[currentImageIndex], memory.description)}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <p className="text-pink-900 font-medium">{memory.description}</p>
      </CardContent>

      <CardFooter className="p-0 flex flex-col border-t border-pink-50">
        <div className="w-full p-3 flex justify-between items-center text-xs text-pink-500 bg-pink-50/30">
          <span>Uploaded by {memory.user.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-pink-600 hover:text-pink-800 hover:bg-pink-100"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {memory.comments?.length || 0} Comments
          </Button>
        </div>

        {showComments && (
          <div className="w-full bg-pink-50/50 p-3 space-y-3">
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-200">
              {memory.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-2 items-start text-xs">
                  <Avatar className="h-5 w-5 border border-pink-100 mt-0.5">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/80 rounded-lg p-2 flex-1 shadow-sm">
                    <span className="font-bold text-pink-800 mr-1">{comment.user.name}</span>
                    <span className="text-pink-700">{comment.content}</span>
                  </div>
                </div>
              ))}
              {(!memory.comments || memory.comments.length === 0) && (
                <p className="text-center text-pink-400 text-xs py-2">No comments yet.</p>
              )}
            </div>

            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="h-8 text-xs bg-white border-pink-200"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-2 bg-pink-500 hover:bg-pink-600"
                  disabled={!comment.trim() || isSubmitting}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
