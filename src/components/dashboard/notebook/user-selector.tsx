import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check } from "lucide-react"

interface UserSelectorProps {
  isOpen: boolean
  onSelect: (user: string) => void
}

const USERS = [
  { name: 'Habib', gender: 'boy', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Shitu', gender: 'girl', color: 'bg-pink-100 text-pink-700 border-pink-200' },
]

export function UserSelector({ isOpen, onSelect }: UserSelectorProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-pink-100 bg-white/90 backdrop-blur-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-pink-800">Who are you? 🤔</DialogTitle>
          <DialogDescription className="text-center text-pink-600">
            Select your identity to continue to the notebook.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {USERS.map((user) => (
            <Button
              key={user.name}
              variant="outline"
              className={`h-auto flex flex-col gap-3 p-6 hover:scale-105 transition-all ${user.color} border-2 hover:bg-opacity-80`}
              onClick={() => onSelect(user.name)}
            >
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">{user.name}</span>
                <span className="text-xs opacity-70">
                  {user.gender === 'boy' ? 'The Cool Boy 😎' : 'The Pretty Girl 🌸'}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
