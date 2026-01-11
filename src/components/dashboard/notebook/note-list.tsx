import { Note } from './notebook'
import { NoteItem } from './note-item'

interface NoteListProps {
  notes: Note[]
  currentUser: string | null
  onReactionUpdate: () => void
}

export function NoteList({ notes, currentUser, onReactionUpdate }: NoteListProps) {
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
          currentUser={currentUser}
          onReactionUpdate={onReactionUpdate}
        />
      ))}
    </div>
  )
}
