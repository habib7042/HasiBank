import { Button } from '@/components/ui/button'
import { LogOut, Building2 } from 'lucide-react'

interface HeaderProps {
  onLogout: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <span>HASHI BANK</span>
      </div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="text-slate-500 hover:text-slate-900"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  )
}
