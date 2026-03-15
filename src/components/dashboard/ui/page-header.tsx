import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  onBack: () => void
  action?: React.ReactNode
}

export function PageHeader({ title, onBack, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pt-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-pink-100 text-pink-700 -ml-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-2xl font-bold text-pink-900">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
