import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Memory {
  id: number
  imageUrl: string
  description: string
  date: string
  user: { name: string }
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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {memories.map((memory) => (
        <Card key={memory.id} className="overflow-hidden border-pink-100 bg-white/80 hover:shadow-lg transition-all group">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={memory.imageUrl}
              alt={memory.description}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 text-pink-700 hover:bg-white border-none shadow-sm">
                {new Date(memory.date).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-pink-900 font-medium">{memory.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 text-xs text-pink-500">
            Uploaded by {memory.user.name}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
