import { MemoryCard } from './memory-card'

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

interface MemoryGalleryProps {
  memories: Memory[]
  currentUser: string | null
  onCommentAdded: () => void
}

export function MemoryGallery({ memories, currentUser, onCommentAdded }: MemoryGalleryProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-12 text-pink-400">
        <p>No memories yet. Upload your first photo! 📸</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          currentUser={currentUser}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  )
}
