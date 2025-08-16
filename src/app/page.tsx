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
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 white-glossy-bg relative overflow-hidden">
        {/* Enhanced Flying Bird Animation */}
        <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
          <div className="animate-fly-bird-continuous text-4xl absolute white-glossy-text">🕊️</div>
        </div>
        
        {/* White Glossy Particles */}
        <div className="white-glossy-particle" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
        <div className="white-glossy-particle" style={{ top: '30%', left: '80%', animationDelay: '1s' }}></div>
        <div className="white-glossy-particle" style={{ top: '60%', left: '20%', animationDelay: '2s' }}></div>
        <div className="white-glossy-particle" style={{ top: '70%', left: '70%', animationDelay: '3s' }}></div>
        
        <div className="text-center space-y-6 z-10">
          <h1 className="text-5xl md:text-7xl font-bold white-glossy-text drop-shadow-lg animate-pulse-glow">
            Welcome to HASHI BANK
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 font-medium drop-shadow-md animate-float">
            We save for the future ✨
          </p>
        </div>
        
        <div className="white-glossy-border rounded-2xl animate-glow">
          <Card className="w-full max-w-md white-glossy-card-glow transform hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl white-glossy-text">Enter PIN</CardTitle>
              <CardDescription className="text-slate-600">
                Please enter your PIN to access your savings account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-slate-700">PIN Number</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center text-lg white-glossy-input placeholder-slate-400"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full white-glossy-button font-bold"
              >
                {isLoading ? "Verifying..." : "Access Account 🚀"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Decorative Elements */}
        <div className="absolute bottom-10 left-10 text-6xl animate-spin-slow white-glossy-text">💰</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-pulse-glow white-glossy-text">🏦</div>
        <div className="absolute top-1/2 left-10 text-4xl animate-float white-glossy-text">🌟</div>
        <div className="absolute top-1/2 right-10 text-4xl animate-float white-glossy-text" style={{ animationDelay: '1s' }}>💎</div>
        
        {/* Shimmer Effect */}
        <div className="white-glossy-shimmer"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen white-glossy-bg p-4 relative overflow-hidden">
      {/* Enhanced Flying Bird Animation */}
      <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
        <div className="animate-fly-bird-continuous text-4xl absolute white-glossy-text">🕊️</div>
      </div>
      
      {/* White Glossy Particles */}
      <div className="white-glossy-particle" style={{ top: '15%', left: '5%', animationDelay: '0.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '25%', left: '85%', animationDelay: '1.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '55%', left: '15%', animationDelay: '2.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '75%', left: '75%', animationDelay: '3.5s' }}></div>
      
      <div className="max-w-6xl mx-auto pt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold white-glossy-text drop-shadow-lg animate-pulse-glow">
              HASHI BANK
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 font-medium drop-shadow-md animate-float">
              We save for the future ✨
            </p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="white-glossy-button font-medium"
          >
            Logout 🚪
          </Button>
        </div>

        <Tabs defaultValue="totals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 white-glossy-card backdrop-blur-sm p-1 rounded-xl border border-white/30">
            <TabsTrigger 
              value="totals" 
              className="data-[state=active]:white-glossy-button data-[state=active]:text-slate-900 text-slate-700 font-medium"
            >
              Account Totals 📊
            </TabsTrigger>
            <TabsTrigger 
              value="deposits" 
              className="data-[state=active]:white-glossy-button data-[state=active]:text-slate-900 text-slate-700 font-medium"
            >
              Add Deposits 💰
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="white-glossy-border rounded-2xl animate-glow">
                <Card className="white-glossy-card-glow transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-center white-glossy-text">Bank Total 🏦</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold white-glossy-text animate-pulse-glow">
                        ৳{bankTotal.toFixed(2)}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Total Savings
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {userTotals.map((user) => (
                <div key={user.userName} className="white-glossy-border rounded-2xl animate-glow">
                  <Card className="white-glossy-card-glow transform hover:scale-105 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-center white-glossy-text">
                        {user.userName} 👤
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold white-glossy-text">
                          ৳{user.totalAmount.toFixed(2)}
                        </div>
                        <Badge variant="secondary" className="white-glossy-button text-slate-700">
                          {user.depositCount} deposits 📝
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="white-glossy-border rounded-2xl animate-glow">
              <Card className="white-glossy-card-glow">
                <CardHeader>
                  <CardTitle className="white-glossy-text">Recent Deposits 📋</CardTitle>
                  <CardDescription className="text-slate-600">
                    Latest deposits in HASHI BANK
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {deposits.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No deposits yet. Add your first deposit! 🎯
                      </p>
                    ) : (
                      deposits.map((deposit) => (
                        <div key={deposit.id} className="white-glossy-card p-3 rounded-lg shadow-sm backdrop-blur-sm transform hover:scale-102 transition-all duration-200 border border-white/20">
                          <div>
                            <p className="font-medium text-slate-800">{deposit.userName}</p>
                            <p className="text-sm text-slate-600">
                              {deposit.month} {deposit.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold white-glossy-text">
                              ৳{deposit.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(deposit.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deposits" className="space-y-6">
            <div className="white-glossy-border rounded-2xl animate-glow">
              <Card className="white-glossy-card-glow">
                <CardHeader>
                  <CardTitle className="white-glossy-text">Add New Deposit 💰</CardTitle>
                  <CardDescription className="text-slate-600">
                    Add a new deposit to HASHI BANK
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-slate-700">User Name</Label>
                      <select
                        id="userName"
                        value={newDeposit.userName}
                        onChange={(e) => setNewDeposit({
                          ...newDeposit,
                          userName: e.target.value
                        })}
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input"
                      >
                        <option value="Shobuj">Shobuj</option>
                        <option value="Shitu">Shitu</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-slate-700">Amount (৳)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={newDeposit.amount}
                        onChange={(e) => setNewDeposit({
                          ...newDeposit,
                          amount: e.target.value
                        })}
                        className="white-glossy-input placeholder-slate-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="month" className="text-slate-700">Month</Label>
                      <select
                        id="month"
                        value={newDeposit.month}
                        onChange={(e) => setNewDeposit({
                          ...newDeposit,
                          month: e.target.value
                        })}
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input"
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
                      <Label htmlFor="year" className="text-slate-700">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="Year"
                        value={newDeposit.year}
                        onChange={(e) => setNewDeposit({
                          ...newDeposit,
                          year: e.target.value
                        })}
                        className="white-glossy-input placeholder-slate-400"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddDeposit}
                    className="w-full white-glossy-button font-bold"
                  >
                    Add Deposit 🚀
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute bottom-10 left-10 text-6xl animate-spin-slow white-glossy-text">💰</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-pulse-glow white-glossy-text">🏦</div>
      <div className="absolute top-1/2 left-10 text-4xl animate-float white-glossy-text">🌟</div>
      <div className="absolute top-1/2 right-10 text-4xl animate-float white-glossy-text" style={{ animationDelay: '1s' }}>💎</div>
      
      {/* Shimmer Effect */}
      <div className="white-glossy-shimmer"></div>
    </div>
  )
}