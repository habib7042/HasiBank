import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import imageCompression from 'browser-image-compression'

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
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [userName, setUserName] = useState(currentUser || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const { toast } = useToast()

  if (currentUser && userName !== currentUser && !userName) {
    setUserName(currentUser)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []

      const options = {
        maxSizeMB: 0.6, // 600KB target
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }

      setStatusMessage('Compressing images...')
      setIsUploading(true) // Show loader while compressing

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          try {
            const compressedFile = await imageCompression(file, options)

            const reader = new FileReader()
            const promise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string)
            })
            reader.readAsDataURL(compressedFile)
            newImages.push(await promise)
          } catch (error) {
            console.error("Compression error:", error)
            toast({
              title: "Compression Failed",
              description: `Could not compress ${file.name}. Using original if small enough.`,
              variant: "destructive"
            })
            // Fallback to original if small enough, otherwise skip
            if (file.size <= 10 * 1024 * 1024) {
               const reader = new FileReader()
               const promise = new Promise<string>((resolve) => {
                 reader.onloadend = () => resolve(reader.result as string)
               })
               reader.readAsDataURL(file)
               newImages.push(await promise)
            }
          }
        }
        setSelectedImages(prev => [...prev, ...newImages])
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong processing images.",
          variant: "destructive"
        })
      } finally {
        setIsUploading(false)
        setStatusMessage('')
      }
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedImages.length === 0 || !description || !date || !userName) return

    setIsUploading(true)
    setUploadProgress(0)
    setStatusMessage('Uploading to server...')

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 500)

    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          date,
          imageUrl: selectedImages[0], // Legacy
          images: selectedImages,
          userName
        }),
      })

      clearInterval(interval)
      setUploadProgress(100)

      if (response.ok) {
        toast({
          title: "Memory Saved 📸",
          description: "Your photos have been added to the gallery.",
        })
        setDescription('')
        setSelectedImages([])
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
      setStatusMessage('')
      setTimeout(() => setUploadProgress(0), 1000)
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
            <Label className="text-pink-700">Photos</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isUploading && statusMessage === 'Compressing images...'}
                className="bg-white/50 border-pink-200 cursor-pointer"
              />
            </div>

            {/* Image Preview Grid */}
            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-full rounded-md overflow-hidden border border-pink-200 group">
                    <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
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

          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-pink-600">
                <span>{statusMessage}</span>
                {statusMessage !== 'Compressing images...' && <span>{uploadProgress}%</span>}
              </div>
              <Progress value={statusMessage === 'Compressing images...' ? undefined : uploadProgress} className="h-2 bg-pink-100" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={isUploading || selectedImages.length === 0 || !description || !userName}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Memory 💖"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
