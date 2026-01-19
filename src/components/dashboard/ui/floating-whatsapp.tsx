'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FloatingWhatsApp() {
  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/8801893669791', '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleOpenWhatsApp}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg border-2 border-white flex items-center justify-center transition-transform hover:scale-110"
        title="Contact Admin on WhatsApp"
      >
        <MessageCircle className="h-8 w-8 text-white" />
        <span className="sr-only">Contact Admin</span>
      </Button>
    </div>
  )
}
