import { Note } from './notebook'
import { NoteItem } from './note-item'

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
  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-pink-400">
        <p>No notes yet. Be the first to share something! 📝</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          users={users}
          onReactionUpdate={onReactionUpdate}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}
