"use client"

import { useState } from "react"
import useSWR from "swr"
import { MapPin, Navigation, Edit2, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface LocationPin {
  id: number
  name: string
  updatedAt: string
  user: { name: string }
}

interface PinMeManagerProps {
  currentUser: string
  users: { id: string, name: string }[]
}

export function PinMeManager({ currentUser, users }: PinMeManagerProps) {
  const { data: locations, error, mutate } = useSWR<LocationPin[]>("/api/location", fetcher, {
    refreshInterval: 10000 // Poll every 10s
  })

  const { toast } = useToast()
  const [isLocating, setIsLocating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [manualLocation, setManualLocation] = useState("")

  const myLocation = locations?.find(loc => loc.user.name === currentUser)
  const otherLocations = locations?.filter(loc => loc.user.name !== currentUser) || []

  // If there are exactly 2 users in the system, we can just grab "the other one"
  // For robustness, we will map through all users so side-by-side works conceptually.
  const displayUsers = users.length > 0 ? users : [{ name: currentUser, id: '1' }]

  const handleLocateMe = () => {
    setIsLocating(true)
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported by your browser", variant: "destructive" })
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding using a free nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=14`)
          const data = await res.json()

          const locationName = data.display_name || "Unknown Location"

          await saveLocation(locationName)
        } catch (error) {
          toast({ title: "Error", description: "Failed to get location name. Try typing it manually.", variant: "destructive" })
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" })
        setIsLocating(false)
      }
    )
  }

  const saveLocation = async (name: string) => {
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userName: currentUser })
      })

      if (res.ok) {
        toast({ title: "Location Updated", description: "Your pin has been dropped!" })
        setIsEditing(false)
        mutate()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update location", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <MapPin className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
        <h2 className="text-2xl font-bold mb-2 relative z-10">Pin Me 📍</h2>
        <p className="text-blue-100 max-w-sm relative z-10">
          Share your current location with each other. Use auto-locate or type it manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayUsers.map(user => {
          const isMe = user.name === currentUser
          const userLocation = locations?.find(l => l.user.name === user.name)

          return (
            <div key={user.id} className={cn(
              "bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border",
              isMe ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{user.name} {isMe && "(You)"}</h3>
                    <p className="text-xs text-slate-400">
                      {userLocation ? new Date(userLocation.updatedAt).toLocaleString() : "Location unknown"}
                    </p>
                  </div>
                </div>
                {isMe && !isEditing && (
                   <Button variant="ghost" size="icon" onClick={() => { setIsEditing(true); setManualLocation(userLocation?.name || "") }} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                     <Edit2 className="h-4 w-4" />
                   </Button>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 min-h-[100px] flex flex-col justify-center relative border border-slate-100">
                {isMe && isEditing ? (
                  <div className="space-y-3 animate-in fade-in">
                     <Input
                       value={manualLocation}
                       onChange={(e) => setManualLocation(e.target.value)}
                       placeholder="e.g. Dhaka, Bangladesh"
                       className="bg-white border-blue-200"
                     />
                     <div className="flex gap-2">
                       <Button
                         variant="outline"
                         className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                         onClick={handleLocateMe}
                         disabled={isLocating}
                       >
                         {isLocating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                         Auto Locate
                       </Button>
                       <Button
                         className="bg-blue-500 hover:bg-blue-600 text-white w-10 px-0 shrink-0"
                         onClick={() => saveLocation(manualLocation)}
                         disabled={!manualLocation.trim() || isLocating}
                       >
                         <Save className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-slate-400 shrink-0">
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className={cn("h-5 w-5 mt-0.5 shrink-0", isMe ? "text-blue-500" : "text-rose-500")} />
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {userLocation ? userLocation.name : "Hasn't pinned a location yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
