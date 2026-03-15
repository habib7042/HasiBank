import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Note } from './notebook'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommentSection } from './comment-section'
import { Heart, ThumbsUp, Smile, Frown, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface NoteDetailModalProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  users: User[]
  onReactionUpdate: () => void
  currentUser: string
}

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500', emoji: '👍' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500', emoji: '❤️' },
  { type: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500', emoji: '😂' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-purple-500', emoji: '😢' },
]

export function NoteDetailModal({ note, isOpen, onClose, users, onReactionUpdate, currentUser }: NoteDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isReacting, setIsReacting] = useState(false)

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (note) {
      setEditedContent(note.content)
      setIsEditing(false)
    }
  }, [note])

  if (!note) return null

  const handleSaveEdit = async () => {
    if (!editedContent.trim() || editedContent === note.content) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      })

      if (response.ok) {
        setIsEditing(false)
        onReactionUpdate()
      }
    } catch (error) {
      console.error('Failed to save edit', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReaction = async (type: string) => {
    if (!currentUser) return
    setIsReacting(true)
    try {
      await fetch(`/api/notes/${note.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser, type }),
      })
      onReactionUpdate()
    } catch (error) {
      console.error('Failed to react', error)
    } finally {
      setIsReacting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        onClose()
        onReactionUpdate() // Refresh list
      }
    } catch (error) {
      console.error('Failed to delete note', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const reactionsByType = note.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const userReaction = note.reactions.find(r => r.user.name === currentUser)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white/95 backdrop-blur-xl border-pink-100 overflow-hidden">
        {/* Header - Fixed */}
        <div className="p-4 sm:p-6 pb-2 border-b border-pink-100 bg-white/50 backdrop-blur-md z-10">
            <div className="flex flex-row items-start gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 border-2 border-pink-100">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.user.name}`} />
                  <AvatarFallback className="bg-pink-100 text-pink-700">{note.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                      <span className="text-base font-bold text-pink-900">{note.user.name}</span>
                      <div className="flex items-center gap-2">
                        {note.emoji && (
                            <span className="text-2xl animate-pulse" title="Mood">{note.emoji}</span>
                        )}
                        {!isEditing && (
                            <>
                              <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-300 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setShowDeleteConfirm(true)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-pink-300 hover:text-pink-600"
                              onClick={() => setIsEditing(true)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                        )}
                      </div>
                  </div>
                  <span className="text-xs text-pink-400">
                      {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
            {isEditing ? (
            <div className="flex flex-col gap-2">
                <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-white border-pink-200 min-h-[150px] text-lg p-4 focus-visible:ring-pink-400"
                />
                <div className="flex justify-end gap-2 mt-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="text-red-500 hover:bg-red-50"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 text-white"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                </div>
            </div>
            ) : (
            <p className="text-pink-900 whitespace-pre-wrap text-base sm:text-lg leading-relaxed">{note.content}</p>
            )}

            <div className="my-6 border-t border-pink-100" />

            <CommentSection
                noteId={note.id}
                comments={note.comments}
                currentUser={currentUser}
                onCommentAdded={onReactionUpdate}
            />
        </div>

        {/* Footer - Fixed */}
        <div className="p-3 sm:p-4 bg-pink-50/80 backdrop-blur-md border-t border-pink-100 flex justify-between items-center z-10">
             <div className="flex gap-1 items-center overflow-x-auto no-scrollbar mask-gradient-right">
                {REACTION_TYPES.map(({ type, icon: Icon, color }) => {
                const isActive = userReaction?.type === type
                const count = reactionsByType[type] || 0

                return (
                    <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "flex items-center gap-1.5 h-9 px-2 sm:px-3 hover:bg-white/80 transition-all shrink-0",
                        isActive && "bg-white shadow-sm ring-1 ring-pink-200 scale-105"
                    )}
                    onClick={() => handleReaction(type)}
                    disabled={isReacting || !currentUser}
                    >
                    <Icon className={cn("h-5 w-5 transition-all", isActive ? `${color} fill-current` : "text-slate-400")} />
                    {count > 0 && <span className="text-sm font-bold text-slate-600">{count}</span>}
                    </Button>
                )
                })}
            </div>
             <div className="text-xs text-pink-400 font-medium whitespace-nowrap pl-2">
                {note.comments.length} comments
            </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note and all its comments and reactions. This action cannot be undone.
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
