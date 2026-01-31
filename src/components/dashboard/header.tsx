import { Button } from '@/components/ui/button'
import { LogOut, Heart } from 'lucide-react'

interface HeaderProps {
  onLogout: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-pink-100 bg-white/70 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-2 font-bold text-xl text-pink-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white shadow-pink-200 shadow-lg">
          <Heart className="h-5 w-5 fill-current" />
        </div>
        <span>HASHI BANK</span>
      </div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="text-pink-600 hover:text-pink-800 hover:bg-pink-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  )
}
