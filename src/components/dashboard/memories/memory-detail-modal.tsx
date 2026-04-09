'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Download, Maximize2, Send, Heart, Edit2, Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  name: string
}

interface MemoryCommentReaction {
  id: number
  type: string
  userId: number
  user: { name: string }
}

interface MemoryComment {
  id: number
  content: string
  createdAt: string
  user: { name: string }
  reactions?: MemoryCommentReaction[]
  parentId?: number | null
}

interface MemoryImage {
  id: number
  url: string
}

export interface Memory {
  id: number
  imageUrl: string | null
  description: string
  date: string
  user: { name: string }
  images: MemoryImage[]
  comments: MemoryComment[]
}

interface MemoryDetailModalProps {
  memory: Memory | null
  isOpen: boolean
  onClose: () => void
  currentUser: string | null
  users: User[]
  onUpdate: () => void
}

export function MemoryDetailModal({
  memory: initialMemory,
  isOpen,
  onClose,
  currentUser,
  users,
  onUpdate
}: MemoryDetailModalProps) {
  const [memory, setMemory] = useState<Memory | null>(initialMemory)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(null)

  // Local user selection state for the comment section if currentUser is not passed or needs override
  const [commentAsUser, setCommentAsUser] = useState<string>(currentUser || '')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editedDesc, setEditedDesc] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && initialMemory) {
      setMemory(initialMemory)
      setEditedDesc(initialMemory.description)
      setCurrentImageIndex(0)
      setCommentAsUser(currentUser || '')
    }
  }, [isOpen, initialMemory, currentUser])

  if (!memory) return null

  const allImages = [
    ...(memory.images?.map(img => img.url) || []),
    ...(memory.imageUrl && !memory.images?.some(img => img.url === memory.imageUrl) ? [memory.imageUrl] : [])
  ]
  const displayImages = allImages.length > 0 ? allImages : ['/placeholder.png']

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = displayImages[currentImageIndex]
    link.download = `memory-${memory.description.slice(0, 20).replace(/\s+/g, '-')}-${currentImageIndex}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('modal-memory-image-container')?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const fetchMemory = async () => {
    try {
      const res = await fetch(`/api/memories/${memory.id}`)
      const data = await res.json()
      if (data.memory) {
        setMemory(data.memory)
        onUpdate() // Notify parent to refresh list if needed
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !commentAsUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/memories/${memory.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, userName: commentAsUser, parentId: replyingTo }),
      })

      if (response.ok) {
        setComment('')
        setReplyingTo(null)
        fetchMemory()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentReaction = async (commentId: number) => {
    if (!commentAsUser) return
    setReactingCommentId(commentId)

    try {
      await fetch(`/api/memories/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: commentAsUser, type: 'love' }),
      })
      fetchMemory()
    } catch (error) {
      console.error('Failed to react to comment', error)
    } finally {
      setReactingCommentId(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editedDesc.trim() || editedDesc === memory.description) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDesc }),
      })

      if (response.ok) {
        setIsEditing(false)
        fetchMemory()
      }
    } catch (error) {
      console.error('Failed to save edit', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        onClose()
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete memory', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] md:h-auto p-0 gap-0 overflow-hidden bg-white border-none flex flex-col md:flex-row">
        <div className="sr-only">
            <DialogTitle>{memory.description}</DialogTitle>
            <DialogDescription>Memory details and comments</DialogDescription>
        </div>

        {/* Image Section */}
        <div
          id="modal-memory-image-container"
          className={cn(
            "relative bg-black flex items-center justify-center transition-all duration-300",
            isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "w-full md:w-[60%] h-[40vh] md:h-[80vh]"
          )}
        >
          <img
            src={displayImages[currentImageIndex]}
            alt={memory.description}
            className="object-contain max-h-full max-w-full"
          />

          {/* Close Button (only visible in fullscreen) */}
           {isFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
              onClick={toggleFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>
          )}

          {/* Navigation Buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-all backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity p-2">
            <Button variant="secondary" size="icon" className="bg-black/40 text-white hover:bg-black/60 h-8 w-8 backdrop-blur-sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/40 text-white hover:bg-black/60 h-8 w-8 backdrop-blur-sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Counter */}
          {displayImages.length > 1 && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full backdrop-blur-md">
               <span className="text-white text-xs font-medium">{currentImageIndex + 1} / {displayImages.length}</span>
             </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 flex flex-col h-[50vh] md:h-[80vh] bg-white">
          {/* Fixed Header */}
          <div className="p-4 md:p-6 border-b border-pink-100 shrink-0 bg-white z-10">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-2">
                 <Avatar className="h-8 w-8 ring-2 ring-pink-100">
                   <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memory.user.name}`} />
                   <AvatarFallback>{memory.user.name[0]}</AvatarFallback>
                 </Avatar>
                 <div>
                   <p className="text-sm font-bold text-pink-900">{memory.user.name}</p>
                   <p className="text-xs text-pink-400">{new Date(memory.date).toLocaleDateString()}</p>
                 </div>
               </div>

               <div className="flex gap-1 md:-mr-2">
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                   onClick={() => setShowDeleteConfirm(true)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
                 {/* Close button for non-fullscreen mode */}
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 md:hidden" onClick={onClose}>
                     <X className="h-5 w-5" />
                 </Button>
               </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30">

             {/* Description Block */}
             <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm relative group">
               {isEditing ? (
                  <div className="flex flex-col gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                    <Textarea
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      className="bg-pink-50/50 border-pink-200 min-h-[80px] w-full text-sm focus-visible:ring-pink-400"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="h-8 px-4 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="h-8 px-4 bg-pink-500 hover:bg-pink-600 text-white gap-2"
                      >
                        <Check className="h-4 w-4" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-pink-900 text-sm md:text-base leading-relaxed pr-6 whitespace-pre-wrap">{memory.description}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-pink-600 hover:bg-pink-50"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
             </div>

             <div className="border-t border-pink-100 w-full" />

             {/* Comments List */}
             {memory.comments?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                   <Heart className="h-12 w-12 stroke-1" />
                   <p className="text-sm">No comments yet. Be the first to show some love!</p>
                </div>
             ) : (
                (() => {
                  const rootComments = memory.comments?.filter(c => !c.parentId) || []
                  const repliesByParentId = memory.comments?.reduce((acc, comment) => {
                    if (comment.parentId) {
                      if (!acc[comment.parentId]) acc[comment.parentId] = []
                      acc[comment.parentId].push(comment)
                    }
                    return acc
                  }, {} as Record<number, MemoryComment[]>) || {}

                  const renderComment = (comment: MemoryComment, isReply = false) => {
                    const reactionsCount = comment.reactions?.length || 0
                    const hasReacted = comment.reactions?.some(r => r.user.name === commentAsUser)
                    const replies = repliesByParentId[comment.id] || []

                    return (
                      <div key={comment.id} className={cn("flex flex-col gap-2 group", isReply ? "mt-3" : "mt-4")}>
                        <div className="flex gap-3">
                          <Avatar className={cn("mt-1 border border-white shadow-sm shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`} />
                            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 max-w-[85%]">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 relative group/comment">
                              <span className="font-bold text-xs text-pink-700 block mb-1">{comment.user.name}</span>
                              <p className="text-sm text-gray-700 break-words leading-snug">{comment.content}</p>

                              {/* Improved Reaction Button */}
                              <button
                                onClick={() => handleCommentReaction(comment.id)}
                                disabled={!commentAsUser || reactingCommentId === comment.id}
                                className={cn(
                                "absolute -right-3 -bottom-3 bg-white border shadow-sm rounded-full py-0.5 px-1.5 flex items-center gap-1 transition-all hover:scale-110 active:scale-95 z-10",
                                hasReacted ? "border-pink-200 bg-pink-50" : "border-gray-200",
                                (reactionsCount > 0 || hasReacted) ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover/comment:opacity-100 group-hover/comment:scale-100"
                                )}
                                title="Love this comment"
                              >
                                <div className={cn("p-1 rounded-full", hasReacted ? "bg-red-100" : "bg-gray-100")}>
                                    <Heart className={cn("h-3 w-3", hasReacted ? "fill-red-500 text-red-500" : "text-gray-400")} />
                                </div>
                                {reactionsCount > 0 && <span className="text-[10px] font-bold text-gray-600 pr-0.5">{reactionsCount}</span>}
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-1 ml-2">
                              <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              {!isReply && (
                                <button
                                  onClick={() => setReplyingTo(comment.id)}
                                  className="text-[10px] font-medium text-gray-500 hover:text-pink-500 transition-colors"
                                >
                                  Reply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {replies.length > 0 && (
                          <div className="ml-11 border-l-2 border-pink-50 pl-4">
                            {replies.map(reply => renderComment(reply, true))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return rootComments.map(c => renderComment(c))
                })()
             )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Commenting as:</span>
                <Select value={commentAsUser} onValueChange={setCommentAsUser}>
                  <SelectTrigger className="h-6 w-auto border-none shadow-none text-xs font-bold text-pink-600 p-0 focus:ring-0">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <div className="flex flex-col gap-2">
                {replyingTo && (
                  <div className="text-xs text-pink-600 flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-md w-fit">
                    Replying to comment
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="hover:text-red-500 ml-2 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="relative flex items-center w-full">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                    className="pr-12 bg-gray-50 border-gray-200 focus-visible:ring-pink-400 rounded-full"
                    onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (comment.trim() && commentAsUser && !isSubmitting) handleCommentSubmit(e);
                       }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim() || !commentAsUser || isSubmitting}
                    className={cn(
                       "absolute right-1 top-1 h-8 w-8 rounded-full transition-all",
                       comment.trim() ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-gray-200 text-gray-400"
                    )}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memory and all its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
