import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

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
  const handleDownload = (imageUrl: string, description: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `memory-${description.slice(0, 20).replace(/\s+/g, '-')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
        <Card key={memory.id} className="overflow-hidden border-pink-100 bg-white/80 hover:shadow-lg transition-all group relative">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={memory.imageUrl}
              alt={memory.description}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className="bg-white/90 text-pink-700 hover:bg-white border-none shadow-sm">
                {new Date(memory.date).toLocaleDateString()}
              </Badge>
            </div>
            {/* Download Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-pink-700"
                onClick={() => handleDownload(memory.imageUrl, memory.description)}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-pink-900 font-medium">{memory.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 text-xs text-pink-500 flex justify-between items-center">
            <span>Uploaded by {memory.user.name}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
