import { useState } from 'react'
import { Note } from './notebook'
import { NoteItem } from './note-item'
import { NoteDetailModal } from './note-detail-modal'

interface User {
  id: string
  name: string
}

interface NoteListProps {
  notes: Note[]
  users: User[]
  onReactionUpdate: () => void
  currentUser: string
}

export function NoteList({ notes, users, onReactionUpdate, currentUser }: NoteListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-pink-400">
        <p>No notes yet. Be the first to share something! 📝</p>
      </div>
    )
  }

  // Update selected note when notes change (e.g. after reaction update)
  const activeNote = selectedNote ? notes.find(n => n.id === selectedNote.id) || null : null

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            users={users}
            onReactionUpdate={onReactionUpdate}
            currentUser={currentUser}
            onOpen={() => setSelectedNote(note)}
          />
        ))}
      </div>

      <NoteDetailModal
        note={activeNote}
        isOpen={!!activeNote}
        onClose={() => setSelectedNote(null)}
        users={users}
        onReactionUpdate={onReactionUpdate}
        currentUser={currentUser}
      />
    </>
  )
}
