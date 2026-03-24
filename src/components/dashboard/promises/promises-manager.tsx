import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ShieldCheck, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  name: string
}

interface PromiseItem {
  id: number
  content: string
  userId: number
  startDate: string
  isActive: boolean
  user: { name: string }
}

interface PromiseManagerProps {
  currentUser: string
}

export function PromiseManager({ currentUser }: PromiseManagerProps) {
  const [promises, setPromises] = useState<PromiseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPromiseContent, setNewPromiseContent] = useState('')

  const loadPromises = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/promises')
      if (response.ok) {
        const data = await response.json()
        setPromises(data.promises)
      }
    } catch (error) {
      console.error('Failed to load promises', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPromises()
  }, [])

  const handleCreatePromise = async () => {
    if (!newPromiseContent.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/promises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPromiseContent,
          userName: currentUser,
        }),
      })

      if (response.ok) {
        setNewPromiseContent('')
        await loadPromises()
      }
    } catch (error) {
      console.error('Failed to create promise', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/promises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (response.ok) {
        await loadPromises()
      }
    } catch (error) {
      console.error('Failed to update promise', error)
    }
  }

  const handleDeletePromise = async (id: number) => {
    try {
      const response = await fetch(`/api/promises/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await loadPromises()
      }
    } catch (error) {
      console.error('Failed to delete promise', error)
    }
  }

  const calculateDays = (startDateString: string) => {
    const start = new Date(startDateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <Card className="border-pink-100 bg-white/70 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-pink-800 flex items-center gap-2">
            প্রতিজ্ঞা <ShieldCheck className="h-5 w-5 text-pink-500" />
          </CardTitle>
          <p className="text-sm text-pink-600">
            Make a promise to yourself. Watch the days grow as you keep it!
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newPromiseContent}
              onChange={(e) => setNewPromiseContent(e.target.value)}
              placeholder="What is your promise? (e.g. No junk food)"
              className="flex-grow border-pink-200 focus-visible:ring-pink-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePromise()
                }
              }}
            />
            <Button
              onClick={handleCreatePromise}
              disabled={isSubmitting || !newPromiseContent.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Promise
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8 text-pink-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : promises.length === 0 ? (
          <div className="col-span-full text-center py-12 text-pink-400 bg-white/50 rounded-xl border border-pink-100 border-dashed">
            <p>No promises made yet. Start a new habit today!</p>
          </div>
        ) : (
          promises.map((promise) => {
            const isOwner = currentUser === promise.user.name
            const days = calculateDays(promise.startDate)

            return (
              <Card
                key={promise.id}
                className={`border-2 transition-all duration-300 ${
                  promise.isActive
                    ? 'border-pink-200 bg-white/80 hover:shadow-md'
                    : 'border-slate-200 bg-slate-50/80 grayscale opacity-80'
                }`}
              >
                <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                  <Avatar className="h-8 w-8 border-2 border-pink-100 mt-1">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${promise.user.name}`} />
                    <AvatarFallback className="bg-pink-100 text-pink-700">{promise.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-pink-900">{promise.user.name}</span>
                      {isOwner && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-pink-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-pink-50/95 border-pink-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-pink-900">Delete Promise?</AlertDialogTitle>
                              <AlertDialogDescription className="text-pink-700/80">
                                Are you sure you want to permanently remove this promise?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-pink-200 hover:bg-pink-100 text-pink-800">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePromise(promise.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <span className="text-xs text-pink-400">
                      Started: {new Date(promise.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-grow">
                  <p className={`text-sm leading-relaxed ${promise.isActive ? 'text-pink-800 font-medium' : 'text-slate-600 line-through'}`}>
                    {promise.content}
                  </p>

                  <div className="mt-4 flex items-center justify-center py-3 bg-pink-50/50 rounded-lg border border-pink-100/50">
                    <div className="text-center">
                      <span className="block text-3xl font-bold text-pink-600 tracking-tight">
                        {days} <span className="text-base font-normal text-pink-400">দিন</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 bg-pink-50/30 flex justify-between items-center rounded-b-xl border-t border-pink-50">
                  <div className="flex items-center gap-2">
                    {promise.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-600 text-xs font-medium border border-green-100">
                        <ShieldCheck className="h-3.5 w-3.5" /> Keeping it!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                        <ShieldAlert className="h-3.5 w-3.5" /> Broken
                      </span>
                    )}
                  </div>

                  {isOwner && (
                    <Button
                      variant={promise.isActive ? "outline" : "secondary"}
                      size="sm"
                      className={`h-7 text-xs ${promise.isActive ? 'border-pink-200 text-pink-600 hover:bg-pink-100' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                      onClick={() => handleToggleStatus(promise.id, promise.isActive)}
                    >
                      {promise.isActive ? 'Break Promise' : 'Restart Promise'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
