import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

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
}

export function MemoryGallery({ memories }: MemoryGalleryProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-12 text-pink-400">
        <p>No memories yet. Upload your first photo! 📸</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {memories.map((memory) => {
        // Display first available image
        const displayImage = memory.images?.[0]?.url || memory.imageUrl || '/placeholder.png'

        return (
          <Link href={`/memories/${memory.id}`} key={memory.id}>
            <Card className="overflow-hidden border-pink-100 bg-white/80 hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col hover:scale-[1.02]">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={displayImage}
                  alt={memory.description}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-pink-700 hover:bg-white border-none shadow-sm text-xs">
                    {new Date(memory.date).toLocaleDateString()}
                  </Badge>
                </div>
                {/* Multi-image indicator */}
                {memory.images && memory.images.length > 1 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-none text-xs">
                      +{memory.images.length - 1} more
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3 flex-grow">
                <p className="text-pink-900 font-medium text-sm line-clamp-2">{memory.description}</p>
              </CardContent>
              <CardFooter className="p-3 pt-0 text-xs text-pink-500 flex justify-between items-center border-t border-pink-50 mt-auto">
                <span className="truncate max-w-[60%]">{memory.user.name}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {memory.comments?.length || 0}
                </span>
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
