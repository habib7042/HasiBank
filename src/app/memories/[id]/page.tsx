'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Download, Maximize2, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/ui/loading-screen'

interface User {
  id: string
  name: string
}

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

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [memory, setMemory] = useState<Memory | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Fetch users for comment selector
    fetch('/api/users').then(res => res.json()).then(data => setUsers(data.users))

    // Fetch memory
    fetch(`/api/memories/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.memory) {
          setMemory(data.memory)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <LoadingScreen />
  if (!memory) return <div className="p-8 text-center">Memory not found</div>

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

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = displayImages[currentImageIndex]
    link.download = `memory-${memory.description.slice(0, 20).replace(/\s+/g, '-')}-${currentImageIndex}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('memory-image-container')?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
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
        // Refresh memory data to show new comment
        const res = await fetch(`/api/memories/${id}`)
        const data = await res.json()
        if (data.memory) setMemory(data.memory)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-pink-700 hover:text-pink-900 hover:bg-pink-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <Card className="overflow-hidden border-pink-100 bg-white shadow-xl">
          <div id="memory-image-container" className={`relative bg-black flex items-center justify-center ${isFullscreen ? 'h-screen w-screen' : 'aspect-video md:aspect-[16/9] lg:h-[600px]'}`}>
            <img
              src={displayImages[currentImageIndex]}
              alt={memory.description}
              className={`object-contain max-h-full max-w-full ${isFullscreen ? 'h-full w-full' : ''}`}
            />

            {/* Navigation */}
            {displayImages.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={handleDownload}>
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={toggleFullscreen}>
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-pink-900">{memory.description}</h1>
                <p className="text-pink-500 text-sm mt-1">Uploaded by {memory.user.name}</p>
              </div>
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 text-base px-3 py-1">
                {new Date(memory.date).toLocaleDateString()}
              </Badge>
            </div>

            <div className="border-t border-pink-100 pt-6">
              <h3 className="text-lg font-semibold text-pink-800 mb-4">Comments</h3>

              <div className="space-y-4 mb-6">
                {memory.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start">
                    <Avatar className="h-8 w-8 border border-pink-100 mt-1">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="bg-pink-50 rounded-xl p-3 flex-1">
                      <span className="font-bold text-pink-900 block text-sm mb-1">{comment.user.name}</span>
                      <p className="text-pink-800 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {memory.comments?.length === 0 && <p className="text-pink-400 italic">No comments yet.</p>}
              </div>

              <div className="flex flex-col gap-3 bg-pink-50/50 p-4 rounded-xl">
                <label className="text-sm font-medium text-pink-700">Comment as:</label>
                <Select value={currentUser} onValueChange={setCurrentUser}>
                  <SelectTrigger className="bg-white border-pink-200 w-[200px]">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="bg-white border-pink-200"
                  />
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || !currentUser || isSubmitting}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
