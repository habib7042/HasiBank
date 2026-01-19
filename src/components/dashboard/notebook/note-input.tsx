import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Send, Smile } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
}

interface NoteInputProps {
  // currentUser: string | null  // Removed as we allow inline selection
  users: User[]
  onNoteCreated: () => void
}

export function NoteInput({ users, onNoteCreated }: NoteInputProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null)
  const { toast } = useToast()

  // Auto-select first user if available and not set
  if (users.length > 0 && !authorName) {
    setAuthorName(users[0].name)
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !authorName) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userName: authorName,
          emoji: selectedEmoji
        }),
      })

      if (response.ok) {
        if (selectedEmoji) {
          setAnimatingEmoji(selectedEmoji)
          setTimeout(() => setAnimatingEmoji(null), 2000)
        }
        setContent('')
        setSelectedEmoji(null)
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
    <div className="relative">
      {/* Animation Layer */}
      {animatingEmoji && (
        <div className="absolute left-1/2 -top-10 text-6xl animate-float-up-sway z-50 pointer-events-none">
          {animatingEmoji}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Selection Inline */}
        <div className="space-y-2">
          <Label htmlFor="author" className="text-pink-700">Posting as</Label>
          <Select
            value={authorName}
            onValueChange={setAuthorName}
          >
            <SelectTrigger className="border-pink-200 focus:ring-pink-400 bg-white/50">
              <SelectValue placeholder="Select user" />
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
          <div className="flex justify-between items-center">
             <Label htmlFor="content" className="text-pink-700">Your Message</Label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   size="sm"
                   className={cn(
                     "h-8 gap-1 border-pink-200 text-pink-600 hover:text-pink-700 hover:bg-pink-50",
                     selectedEmoji && "bg-pink-50 border-pink-300 ring-1 ring-pink-200"
                   )}
                 >
                   {selectedEmoji ? (
                     <span className="text-lg leading-none">{selectedEmoji}</span>
                   ) : (
                     <Smile className="h-4 w-4" />
                   )}
                   <span className="text-xs">{selectedEmoji ? 'Change Mood' : 'Add Mood'}</span>
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-full border-none p-0 bg-transparent shadow-none" align="end">
                 <EmojiPicker
                   onEmojiClick={handleEmojiClick}
                   width={300}
                   height={350}
                 />
               </PopoverContent>
             </Popover>
          </div>
          <Textarea
            id="content"
            placeholder={`What's on your mind?`}
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
    </div>
  )
}
