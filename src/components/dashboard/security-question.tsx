'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Angry, ShieldQuestion } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription as DialogDesc } from '@/components/ui/dialog'

interface SecurityQuestionProps {
  onSuccess: () => void
}

export function SecurityQuestion({ onSuccess }: SecurityQuestionProps) {
  const [answer, setAnswer] = useState('')
  const [showError, setShowError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ans = answer.toLowerCase().trim()
    if (ans === 'idiot' || ans === 'pagli') {
      onSuccess()
    } else {
      setShowError(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Abstract Background */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-pink-100/50 blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl" />
       </div>

       <Card className="w-full max-w-md border-pink-100 shadow-xl bg-white/90 backdrop-blur-sm z-10">
         <CardHeader className="text-center">
           <div className="mx-auto bg-pink-50 p-3 rounded-full w-fit mb-4">
             <ShieldQuestion className="h-8 w-8 text-pink-500" />
           </div>
           <CardTitle className="text-xl text-pink-900">Final Security Check</CardTitle>
           <CardDescription>Just one more question...</CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-semibold text-pink-800 block text-center">আপনার নাম কী?</label>
               <Input
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder="Type your answer..."
                 className="text-center border-pink-200 focus-visible:ring-pink-400"
               />
             </div>
             <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 font-bold">
               Verify Identity
             </Button>
           </form>
         </CardContent>
       </Card>

       <Dialog open={showError} onOpenChange={setShowError}>
         <DialogContent className="sm:max-w-sm bg-white border-red-200 shadow-2xl">
           <div className="sr-only">
             <DialogTitle>Access Denied</DialogTitle>
             <DialogDesc>Incorrect answer provided</DialogDesc>
           </div>

           <div className="flex flex-col items-center gap-4 py-6 text-center animate-in zoom-in-95 duration-200">
             <div className="p-4 bg-red-100 rounded-full animate-bounce">
               <Angry className="h-16 w-16 text-red-600" />
             </div>
             <h2 className="text-3xl font-black text-red-600 tracking-tight">GET LOST! 😡</h2>
             <p className="text-red-800 font-medium">Wrong answer. You don't belong here.</p>
             <Button
               variant="destructive"
               className="w-full mt-2 bg-red-600 hover:bg-red-700"
               onClick={() => {
                 setShowError(false)
                 setAnswer('')
               }}
             >
               Try Again
             </Button>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  )
}
