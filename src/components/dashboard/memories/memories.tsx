import { MemoryUploader } from './memory-uploader'
import { MemoryGallery } from './memory-gallery'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

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

async function fetchMemories() {
  const response = await fetch('/api/memories')
  if (!response.ok) {
    throw new Error('Failed to fetch memories')
  }
  const data = await response.json()
  return data.memories as Memory[]
}

export function Memories({ currentUser, users }: MemoriesProps) {
  const { data: memories = [], isLoading, refetch } = useQuery({
    queryKey: ['memories'],
    queryFn: fetchMemories,
  })

  // Use refetch for actions that update data
  const handleDataUpdate = () => {
    refetch()
  }

  return (
    <div className="space-y-8 pb-8">
      <MemoryUploader
        users={users}
        onUploadComplete={handleDataUpdate}
        currentUser={currentUser}
      />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : (
        <MemoryGallery
          memories={memories}
          currentUser={currentUser}
          onCommentAdded={handleDataUpdate}
        />
      )}
    </div>
  )
}
