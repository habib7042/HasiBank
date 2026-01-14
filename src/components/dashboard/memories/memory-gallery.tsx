import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Heart } from 'lucide-react'
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
            <Card className="overflow-hidden border-2 border-pink-100 bg-white/70 backdrop-blur-md hover:shadow-xl hover:shadow-pink-100 transition-all duration-300 group cursor-pointer h-full flex flex-col hover:scale-[1.03] rounded-2xl">
              <div className="aspect-square relative overflow-hidden bg-pink-50">
                <img
                  src={displayImage}
                  alt={memory.description}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-pink-600 hover:bg-white border-pink-100 shadow-sm text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    {new Date(memory.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>

                {/* Multi-image indicator */}
                {memory.images && memory.images.length > 1 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/40 text-white border-none text-[10px] backdrop-blur-md">
                      +{memory.images.length - 1} more
                    </Badge>
                  </div>
                )}

                {/* Heart Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <Heart className="w-12 h-12 text-white fill-white/50 drop-shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75" />
                </div>
              </div>

              <CardContent className="p-3 flex-grow">
                <p className="text-pink-900 font-medium text-sm line-clamp-2 leading-relaxed">{memory.description}</p>
              </CardContent>

              <CardFooter className="p-3 pt-0 text-xs text-pink-500/80 flex justify-between items-center border-t border-pink-50/50 mt-auto bg-pink-50/30">
                <span className="truncate max-w-[60%] font-medium">{memory.user.name}</span>
                <span className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
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
