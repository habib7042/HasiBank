import { useState, useEffect } from 'react'
import { MemoryUploader } from './memory-uploader'
import { MemoryGallery } from './memory-gallery'

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

interface MemoriesProps {
  currentUser: string | null
  users: User[]
}

export function Memories({ currentUser, users }: MemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMemories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/memories')
      if (response.ok) {
        const data = await response.json()
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Failed to load memories', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [])

  return (
    <div className="space-y-8 pb-8">
      <MemoryUploader
        users={users}
        onUploadComplete={loadMemories}
        currentUser={currentUser}
      />
      <MemoryGallery
        memories={memories}
        currentUser={currentUser}
        onCommentAdded={loadMemories}
      />
    </div>
  )
}
