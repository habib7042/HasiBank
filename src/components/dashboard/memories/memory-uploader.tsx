import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePlus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
}

interface MemoryUploaderProps {
  users: User[]
  onUploadComplete: () => void
  currentUser: string | null
}

export function MemoryUploader({ users, onUploadComplete, currentUser }: MemoryUploaderProps) {
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [userName, setUserName] = useState(currentUser || '')
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  if (currentUser && userName !== currentUser && !userName) {
    setUserName(currentUser)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage || !description || !date || !userName) return

    setIsUploading(true)
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          date,
          imageUrl: selectedImage,
          userName
        }),
      })

      if (response.ok) {
        toast({
          title: "Memory Saved 📸",
          description: "Your photo has been added to the gallery.",
        })
        setDescription('')
        setSelectedImage(null)
        onUploadComplete()
      } else {
        throw new Error('Failed to upload')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-pink-100 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-pink-800 flex items-center gap-2">
          Add New Memory <ImagePlus className="h-5 w-5" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!currentUser && (
            <div className="space-y-2">
              <Label className="text-pink-700">Who is uploading?</Label>
              <Select value={userName} onValueChange={setUserName}>
                <SelectTrigger className="bg-white/50 border-pink-200">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-pink-700">Photo</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-white/50 border-pink-200 cursor-pointer"
              />
            </div>
            {selectedImage && (
              <div className="mt-2 relative h-40 w-full overflow-hidden rounded-lg border-2 border-pink-100">
                <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-pink-700">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened on this day?..."
              className="bg-white/50 border-pink-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-pink-700">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/50 border-pink-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={isUploading || !selectedImage || !description || !userName}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Memory 💖"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
