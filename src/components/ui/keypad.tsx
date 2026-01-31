import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"
import { cn } from "@/lib/utils"

interface KeypadProps {
  onKeyPress: (key: string) => void
  onDelete: () => void
  maxLength?: number
  currentLength?: number
  variant?: 'love' | 'professional'
}

export function Keypad({ onKeyPress, onDelete, maxLength = 4, currentLength = 0, variant = 'love' }: KeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL']

  const handlePress = (key: string) => {
    if (key === 'DEL') {
      onDelete()
    } else if (key !== '') {
      if (currentLength < maxLength) {
        onKeyPress(key)
      }
    }
  }

  const getButtonStyles = (key: string) => {
    if (key === 'DEL') {
      return 'text-red-500 border-red-200 hover:bg-red-50'
    }

    if (variant === 'professional') {
      return 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
    }

    // Default 'love' theme
    return 'border-pink-200 hover:bg-pink-50 text-pink-700'
  }

  return (
    <div className="grid grid-cols-3 gap-4 max-w-[250px] mx-auto mt-4">
      {keys.map((key, index) => (
        <Button
          key={index}
          variant="outline"
          className={cn(
            "h-14 text-xl font-semibold rounded-full transition-all active:scale-95",
            key === '' ? 'invisible' : '',
            getButtonStyles(key)
          )}
          onClick={() => handlePress(key)}
          disabled={key === ''}
          type="button"
        >
          {key === 'DEL' ? <Delete className="h-6 w-6" /> : key}
        </Button>
      ))}
    </div>
  )
}
