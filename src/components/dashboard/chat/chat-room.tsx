"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Send, Image as ImageIcon, Smile, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ChatMessage {
  id: number
  content: string | null
  imageUrl: string | null
  createdAt: string
  user: { name: string }
}

interface ChatRoomProps {
  currentUser: string
}

export function ChatRoom({ currentUser }: ChatRoomProps) {
  const { data: messages, error, mutate } = useSWR<ChatMessage[]>(
    "/api/chat",
    fetcher,
    { refreshInterval: 2000 } // Poll every 2 seconds
  )

  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("baseContext" /* TS type workaround */) as any || canvas.getContext("2d")

        let width = img.width
        let height = img.height

        const MAX_DIMENSION = 800
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width
            width = MAX_DIMENSION
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height
            height = MAX_DIMENSION
          }
        }

        canvas.width = width
        canvas.height = height
        const context = canvas.getContext("2d")
        if (context) {
          context.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6)
          setSelectedImage(compressedBase64)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentUser,
          content: newMessage.trim() || null,
          imageUrl: selectedImage || null,
        }),
      })

      if (res.ok) {
        setNewMessage("")
        setSelectedImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        mutate() // Optimistic UI update could be added here, but SWR polling is fast enough
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const isLoading = !messages && !error

  return (
    <div className="flex flex-col h-[70vh] max-h-[800px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-pink-100 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-4 shrink-0 shadow-sm z-10 flex justify-between items-center gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-lg leading-tight">যোগাযোগ</h2>
            <a
              href="https://hashica8.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors flex items-center gap-1 border border-white/20 shadow-sm"
            >
              <Send className="w-3 h-3" /> Quick Chat
            </a>
          </div>
          <p className="text-pink-100 text-xs font-medium mt-1">Messages disappear after 7 days</p>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-md shrink-0">
          {currentUser}
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fff5f7] scroll-smooth relative"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-pink-300">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">Failed to load messages</div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-pink-400/50 space-y-2">
             <Smile className="w-12 h-12 opacity-50" />
             <p className="text-sm font-medium">Start the conversation!</p>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isMe = msg.user.name === currentUser
            const showAvatar = index === messages.length - 1 || messages[index + 1]?.user.name !== msg.user.name

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 max-w-[85%]",
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {!isMe && showAvatar && (
                  <Avatar className="h-6 w-6 shrink-0 mb-1 ring-2 ring-white shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user.name}`} />
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-xs">{msg.user.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                {!isMe && !showAvatar && <div className="w-6 shrink-0" />}

                <div
                  className={cn(
                    "flex flex-col relative group",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-snug break-words max-w-full",
                      isMe
                        ? "bg-pink-500 text-white rounded-br-sm"
                        : "bg-white border border-pink-100 text-slate-800 rounded-bl-sm",
                      msg.imageUrl && !msg.content ? "p-1.5 bg-transparent border-none shadow-none" : ""
                    )}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Shared image"
                        className="rounded-xl max-w-[200px] sm:max-w-[250px] w-full object-cover mb-1 border border-pink-100/50 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                        loading="lazy"
                        onClick={() => setViewingImage(msg.imageUrl)}
                      />
                    )}
                    {msg.content && <span className="whitespace-pre-wrap">{msg.content}</span>}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] text-slate-400 mt-1 mx-1 font-medium",
                      isMe ? "text-right" : "text-left"
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Image Preview Overlay */}
      {selectedImage && (
        <div className="absolute bottom-[72px] left-4 bg-white/95 p-2 rounded-xl shadow-lg border border-pink-200 z-20">
           <div className="relative">
             <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-pink-100" />
             <button
               onClick={() => setSelectedImage(null)}
               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
             >
               <X className="w-3 h-3" />
             </button>
           </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t border-pink-100 p-3 shrink-0 flex items-end gap-2 relative z-20"
      >
        <div className="flex gap-1 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-full shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-auto p-0 border-none shadow-xl rounded-2xl">
              <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-full shrink-0 relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="min-h-[40px] max-h-[120px] resize-none py-2.5 px-4 bg-slate-50 border-transparent focus-visible:ring-pink-300 rounded-2xl flex-1 text-[15px] leading-relaxed shadow-inner"
          rows={1}
        />

        <Button
          type="submit"
          disabled={(!newMessage.trim() && !selectedImage) || isSubmitting}
          className="h-10 w-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white shrink-0 shadow-md disabled:opacity-50 transition-all p-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </Button>
      </form>

      {/* Full Screen Image Viewer Modal */}
      <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
        <DialogContent className="max-w-4xl w-full p-1 bg-black/95 border-none shadow-2xl flex flex-col justify-center items-center h-[90vh]">
          {viewingImage && (
            <>
              <div className="w-full flex justify-end p-2 absolute top-0 right-0 z-50">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-none gap-2"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = viewingImage;
                    a.download = `chat-image-${new Date().getTime()}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <Download className="w-4 h-4" /> Download
                </Button>
              </div>
              <img
                src={viewingImage}
                alt="Full screen preview"
                className="max-h-[85vh] max-w-full object-contain"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
