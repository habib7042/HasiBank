import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

interface KeypadProps {
  onKeyPress: (key: string) => void
  onDelete: () => void
  maxLength?: number
  currentLength?: number
}

export function Keypad({ onKeyPress, onDelete, maxLength = 4, currentLength = 0 }: KeypadProps) {
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

  return (
    <div className="grid grid-cols-3 gap-4 max-w-[250px] mx-auto mt-4">
      {keys.map((key, index) => (
        <Button
          key={index}
          variant="outline"
          className={`h-14 text-xl font-semibold rounded-full ${
            key === '' ? 'invisible' : ''
          } ${key === 'DEL' ? 'text-red-500 border-red-200 hover:bg-red-50' : 'border-pink-200 hover:bg-pink-50 text-pink-700'}`}
          onClick={() => handlePress(key)}
          disabled={key === ''}
          type="button" // Prevent form submission
        >
          {key === 'DEL' ? <Delete className="h-6 w-6" /> : key}
        </Button>
      ))}
    </div>
  )
}
