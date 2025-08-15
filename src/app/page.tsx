'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface UserTotal {
  userName: string
  totalAmount: number
  depositCount: number
}

interface Deposit {
  id: string
  amount: number
  month: string
  year: string
  userName: string
  createdAt: string
}

export default function Home() {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [newDeposit, setNewDeposit] = useState({
    userName: 'Shobuj',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadTotals()
      loadDeposits()
    }
  }, [isAuthenticated])

  const loadTotals = async () => {
    try {
      const response = await fetch('/api/totals')
      if (response.ok) {
        const data = await response.json()
        setUserTotals(data.userTotals)
        setBankTotal(data.bankTotal)
      }
    } catch (error) {
      console.error('Error loading totals:', error)
    }
  }

  const loadDeposits = async () => {
    try {
      const response = await fetch('/api/deposits')
      if (response.ok) {
        const data = await response.json()
        setDeposits(data.deposits)
      }
    } catch (error) {
      console.error('Error loading deposits:', error)
    }
  }

  const handleLogin = async () => {
    if (!pin) {
      toast({
        title: "PIN Required",
        description: "Please enter your PIN to access HASHI BANK",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        toast({
          title: "Access Granted",
          description: "Welcome to HASHI BANK!",
        })
        setIsAuthenticated(true)
        
        // Initialize users if needed
        await fetch('/api/init', { method: 'POST' })
      } else {
        toast({
          title: "Invalid PIN",
          description: "Please check your PIN and try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to verify PIN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDeposit = async () => {
    if (!newDeposit.amount || parseFloat(newDeposit.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeposit),
      })

      if (response.ok) {
        toast({
          title: "Deposit Added",
          description: `Successfully added deposit for ${newDeposit.userName}`,
        })
        setNewDeposit({
          ...newDeposit,
          amount: ''
        })
        loadTotals()
        loadDeposits()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add deposit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to add deposit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPin('')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gradient-to-br from-blue-900 via-black to-blue-900 animate-gradient-x relative overflow-hidden">
        {/* Flying Bird Animation - Continuous */}
        <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
          <div className="animate-fly-bird-continuous text-4xl absolute">🕊️</div>
        </div>
        
        <div className="text-center space-y-6 z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-cyan-400 drop-shadow-lg animate-pulse">
            Welcome to HASHI BANK
          </h1>
          <p className="text-2xl md:text-3xl text-blue-300 font-medium drop-shadow-md animate-bounce">
            We save for the future ✨
          </p>
        </div>
        
        <Card className="w-full max-w-md backdrop-blur-sm bg-black/40 border-blue-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-cyan-400">Enter PIN</CardTitle>
            <CardDescription className="text-blue-300/80">
              Please enter your PIN to access your savings account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-blue-300">PIN Number</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="text-center text-lg bg-black/60 border-blue-500/50 text-cyan-400 placeholder-blue-500/60"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? "Verifying..." : "Access Account 🚀"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 text-6xl animate-spin-slow text-cyan-400">💰</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-pulse text-blue-400">🏦</div>
        <div className="absolute top-1/2 left-10 text-4xl animate-bounce text-cyan-300">🌟</div>
        <div className="absolute top-1/2 right-10 text-4xl animate-bounce text-blue-300">💎</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 animate-gradient-x p-4 relative overflow-hidden">
      {/* Flying Bird Animation - Continuous */}
      <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
        <div className="animate-fly-bird-continuous text-4xl absolute">🕊️</div>
      </div>
      
      <div className="max-w-6xl mx-auto pt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 drop-shadow-lg animate-pulse">
              HASHI BANK
            </h1>
            <p className="text-xl md:text-2xl text-blue-300 font-medium drop-shadow-md">
              We save for the future ✨
            </p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="bg-black/40 hover:bg-black/60 text-cyan-400 border-blue-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
          >
            Logout 🚪
          </Button>
        </div>

        <Tabs defaultValue="totals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 backdrop-blur-sm p-1 rounded-lg border border-blue-500/30">
            <TabsTrigger 
              value="totals" 
              className="data-[state=active]:bg-blue-900/50 text-cyan-400 font-medium"
            >
              Account Totals 📊
            </TabsTrigger>
            <TabsTrigger 
              value="deposits" 
              className="data-[state=active]:bg-blue-900/50 text-cyan-400 font-medium"
            >
              Add Deposits 💰
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-black/40 border-blue-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-center text-cyan-400">Bank Total 🏦</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-300 animate-pulse">
                      ৳{bankTotal.toFixed(2)}
                    </div>
                    <p className="text-sm text-blue-300/80 mt-2">
                      Total Savings
                    </p>
                  </div>
                </CardContent>
              </Card>

              {userTotals.map((user) => (
                <Card key={user.userName} className="backdrop-blur-sm bg-black/40 border-blue-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-center text-cyan-400">
                      {user.userName} 👤
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-cyan-300">
                        ৳{user.totalAmount.toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="bg-blue-900/50 text-cyan-400">
                        {user.depositCount} deposits 📝
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="backdrop-blur-sm bg-black/40 border-blue-500/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-400">Recent Deposits 📋</CardTitle>
                <CardDescription className="text-blue-300/80">
                  Latest deposits in HASHI BANK
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {deposits.length === 0 ? (
                    <p className="text-center text-blue-300/60 py-8">
                      No deposits yet. Add your first deposit! 🎯
                    </p>
                  ) : (
                    deposits.map((deposit) => (
                      <div key={deposit.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg shadow-sm backdrop-blur-sm transform hover:scale-102 transition-all duration-200 border border-blue-500/20">
                        <div>
                          <p className="font-medium text-cyan-400">{deposit.userName}</p>
                          <p className="text-sm text-blue-300/70">
                            {deposit.month} {deposit.year}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-300">
                            ৳{deposit.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-blue-300/60">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-6">
            <Card className="backdrop-blur-sm bg-black/40 border-blue-500/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-cyan-400">Add New Deposit 💰</CardTitle>
                <CardDescription className="text-blue-300/80">
                  Add a new deposit to HASHI BANK
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-cyan-400">User Name</Label>
                    <select
                      id="userName"
                      value={newDeposit.userName}
                      onChange={(e) => setNewDeposit({
                        ...newDeposit,
                        userName: e.target.value
                      })}
                      className="w-full p-2 border border-blue-500/30 rounded-md bg-black/60 text-cyan-400"
                    >
                      <option value="Shobuj">Shobuj</option>
                      <option value="Shitu">Shitu</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-cyan-400">Amount (৳)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={newDeposit.amount}
                      onChange={(e) => setNewDeposit({
                        ...newDeposit,
                        amount: e.target.value
                      })}
                      className="bg-black/60 border-blue-500/30 text-cyan-400 placeholder-blue-500/60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="month" className="text-cyan-400">Month</Label>
                    <select
                      id="month"
                      value={newDeposit.month}
                      onChange={(e) => setNewDeposit({
                        ...newDeposit,
                        month: e.target.value
                      })}
                      className="w-full p-2 border border-blue-500/30 rounded-md bg-black/60 text-cyan-400"
                    >
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-cyan-400">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="Year"
                      value={newDeposit.year}
                      onChange={(e) => setNewDeposit({
                        ...newDeposit,
                        year: e.target.value
                      })}
                      className="bg-black/60 border-blue-500/30 text-cyan-400 placeholder-blue-500/60"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddDeposit}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Add Deposit 🚀
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 text-6xl animate-spin-slow text-cyan-400">💰</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-pulse text-blue-400">🏦</div>
      <div className="absolute top-1/2 left-10 text-4xl animate-bounce text-cyan-300">🌟</div>
      <div className="absolute top-1/2 right-10 text-4xl animate-bounce text-blue-300">💎</div>
    </div>
  )
}