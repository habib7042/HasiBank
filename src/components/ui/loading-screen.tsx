import { Heart } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-pink-50/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 bg-pink-300 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-0 bg-pink-400 rounded-full opacity-10 animate-ping delay-75"></div>

        {/* Main Icon */}
        <div className="bg-white p-6 rounded-full shadow-xl shadow-pink-200 relative z-10 animate-bounce">
          <Heart className="h-16 w-16 text-pink-500 fill-pink-500 animate-pulse" />
        </div>
      </div>

      <div className="mt-8 space-y-2 text-center">
        <h2 className="text-2xl font-bold text-pink-800 animate-pulse">HASHI BANK</h2>
        <p className="text-pink-600 font-medium">Loading your vault... 💖</p>
      </div>
    </div>
  )
}
