import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface AppIconProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  color?: string
  gradient?: string
}

export function AppIcon({ icon: Icon, label, onClick, color = "text-white", gradient = "from-pink-500 to-rose-500" }: AppIconProps) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <button
        onClick={onClick}
        className={cn(
          "w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl active:scale-95 bg-gradient-to-br",
          gradient
        )}
      >
        <Icon className={cn("w-10 h-10 md:w-12 md:h-12", color)} />
      </button>
      <span className="text-sm font-medium text-pink-900 group-hover:text-pink-700 transition-colors">
        {label}
      </span>
    </div>
  )
}
