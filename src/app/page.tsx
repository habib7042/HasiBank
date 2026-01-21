'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-1000">
        <h1 className="text-2xl md:text-4xl font-serif tracking-wide leading-relaxed">
          "জীবন দুই দিনের, ভালোবাসা চিরস্থায়ী।<br />
          আমি জীবন থেকে অবসর নিচ্ছি।"
        </h1>
      </div>
    </div>
  )
}
