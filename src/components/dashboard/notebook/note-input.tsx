import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
}

interface NoteInputProps {
  currentUser: string | null
  users: User[]
  onNoteCreated: () => void
}

export function NoteInput({ currentUser, users, onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState(currentUser || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Update local author state if prop changes (e.g. initial load)
  if (currentUser && authorName !== currentUser && !authorName) {
    setAuthorName(currentUser)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !authorName) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userName: authorName }),
      })

      if (response.ok) {
        setContent('')
        toast({
          title: "Note Shared 💌",
          description: "Your message has been posted to the community.",
        })
        onNoteCreated()
      } else {
        throw new Error('Failed to post note')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share your note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="author" className="text-pink-700">Posting as</Label>
        <Select
          value={authorName}
          onValueChange={setAuthorName}
        >
          <SelectTrigger className="border-pink-200 focus:ring-pink-400 bg-white/50">
            <SelectValue placeholder="Select who you are..." />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.name}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-pink-700">Your Message</Label>
        <Textarea
          id="content"
          placeholder="Share something with the family..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] border-pink-200 focus-visible:ring-pink-400 bg-white/50 placeholder:text-pink-300/70"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || !authorName || isSubmitting}
          className="bg-pink-500 hover:bg-pink-600 text-white font-medium"
        >
          {isSubmitting ? "Posting..." : (
            <>
              Post Note <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
