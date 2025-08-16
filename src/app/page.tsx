'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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

interface User {
  id: string
  name: string
}

export default function Home() {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newDeposit, setNewDeposit] = useState({
    userName: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const [confirmPin, setConfirmPin] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isAddingDeposit, setIsAddingDeposit] = useState(false)
  const [newWithdrawal, setNewWithdrawal] = useState({
    userName: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const [withdrawalConfirmPin, setWithdrawalConfirmPin] = useState('')
  const [isWithdrawalConfirmed, setIsWithdrawalConfirmed] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadTotals()
      loadDeposits()
      loadUsers()
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        // Set default user if none is selected
        if (!newDeposit.userName && data.users.length > 0) {
          setNewDeposit(prev => ({
            ...prev,
            userName: data.users[0].name
          }))
        }
        if (!newWithdrawal.userName && data.users.length > 0) {
          setNewWithdrawal(prev => ({
            ...prev,
            userName: data.users[0].name
          }))
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
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
        // Load users to ensure we have the latest data
        loadUsers()
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

    if (!confirmPin || confirmPin.length !== 4) {
      toast({
        title: "PIN Required",
        description: "Please enter your 4-digit PIN to confirm this deposit",
        variant: "destructive",
      })
      return
    }

    if (!isConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please check the 'Are you sure?' box to confirm this deposit",
        variant: "destructive",
      })
      return
    }

    setIsAddingDeposit(true)
    try {
      // First verify the PIN
      const pinResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: confirmPin }),
      })

      if (!pinResponse.ok) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect. Please try again.",
          variant: "destructive",
        })
        setConfirmPin('')
        setIsAddingDeposit(false)
        return
      }

      // If PIN is valid, proceed with adding the deposit
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeposit),
      })

      if (response.ok) {
        toast({
          title: "Deposit Added Successfully",
          description: `Added ৳${newDeposit.amount} deposit for ${newDeposit.userName}`,
        })
        // Reset form
        setNewDeposit({
          ...newDeposit,
          amount: ''
        })
        setConfirmPin('')
        setIsConfirmed(false)
        // Refresh data
        loadTotals()
        loadDeposits()
        loadUsers()
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
    } finally {
      setIsAddingDeposit(false)
    }
  }

  const handleWithdrawal = async () => {
    if (!newWithdrawal.amount || parseFloat(newWithdrawal.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!withdrawalConfirmPin || withdrawalConfirmPin.length !== 4) {
      toast({
        title: "PIN Required",
        description: "Please enter your 4-digit PIN to confirm this withdrawal",
        variant: "destructive",
      })
      return
    }

    if (!isWithdrawalConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please check the 'Are you sure?' box to confirm this withdrawal",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)
    try {
      // First verify the PIN
      const pinResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: withdrawalConfirmPin }),
      })

      if (!pinResponse.ok) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect. Please try again.",
          variant: "destructive",
        })
        setWithdrawalConfirmPin('')
        setIsWithdrawing(false)
        return
      }

      // If PIN is valid, proceed with the withdrawal
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWithdrawal),
      })

      if (response.ok) {
        toast({
          title: "Withdrawal Processed Successfully",
          description: `Withdrew ৳${newWithdrawal.amount} for ${newWithdrawal.userName}`,
        })
        // Reset form
        setNewWithdrawal({
          ...newWithdrawal,
          amount: ''
        })
        setWithdrawalConfirmPin('')
        setIsWithdrawalConfirmed(false)
        // Refresh data
        loadTotals()
        loadDeposits()
        loadUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to process withdrawal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPin('')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 white-glossy-bg relative overflow-hidden">
        {/* Static Bird */}
        <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
          <div className="text-4xl absolute white-glossy-text">🕊️</div>
        </div>
        
        {/* White Glossy Particles */}
        <div className="white-glossy-particle" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
        <div className="white-glossy-particle" style={{ top: '30%', left: '80%', animationDelay: '1s' }}></div>
        <div className="white-glossy-particle" style={{ top: '60%', left: '20%', animationDelay: '2s' }}></div>
        <div className="white-glossy-particle" style={{ top: '70%', left: '70%', animationDelay: '3s' }}></div>
        
        <div className="text-center space-y-6 z-10">
          <h1 className="text-5xl md:text-7xl font-bold white-glossy-text drop-shadow-lg">
            Welcome to HASHI BANK
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 font-medium drop-shadow-md">
            We save for the future ✨
          </p>
        </div>
        
        <div className="white-glossy-border rounded-2xl">
          <Card className="white-glossy-card-enhanced">
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
                  className="text-center text-lg white-glossy-input-enhanced placeholder-slate-400"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full white-glossy-button-enhanced font-bold"
              >
                {isLoading ? "Verifying..." : "Access Account 🚀"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Shimmer Effect */}
        <div className="white-glossy-shimmer"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen white-glossy-bg p-4 relative overflow-hidden">
      {/* Static Bird */}
      <div className="absolute top-10 left-0 w-full h-20 overflow-hidden pointer-events-none">
        <div className="text-4xl absolute white-glossy-text">🕊️</div>
      </div>
      
      {/* White Glossy Particles */}
      <div className="white-glossy-particle" style={{ top: '15%', left: '5%', animationDelay: '0.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '25%', left: '85%', animationDelay: '1.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '55%', left: '15%', animationDelay: '2.5s' }}></div>
      <div className="white-glossy-particle" style={{ top: '75%', left: '75%', animationDelay: '3.5s' }}></div>
      
      <div className="max-w-6xl mx-auto pt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold white-glossy-text drop-shadow-lg">
              HASHI BANK
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 font-medium drop-shadow-md">
              We save for the future ✨
            </p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="white-glossy-button-enhanced font-medium"
          >
            Logout 🚪
          </Button>
        </div>

        <Tabs defaultValue="totals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 white-glossy-card backdrop-blur-sm p-1 rounded-xl border border-white/30">
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
            <TabsTrigger 
              value="withdrawals" 
              className="data-[state=active]:white-glossy-button data-[state=active]:text-slate-900 text-slate-700 font-medium"
            >
              Withdraw 💸
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="white-glossy-border rounded-2xl">
                <Card className="white-glossy-card-enhanced">
                  <CardHeader>
                    <CardTitle className="text-center white-glossy-text">Bank Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${bankTotal >= 0 ? 'white-glossy-text' : 'text-red-500'}`}>
                        ৳{Math.abs(bankTotal).toFixed(2)}{bankTotal < 0 ? ' (Debt)' : ''}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        {bankTotal >= 0 ? 'Total Savings' : 'Total Debt'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {userTotals.map((user) => (
                <div key={user.userName} className="white-glossy-border rounded-2xl">
                  <Card className="white-glossy-card-enhanced">
                    <CardHeader>
                      <CardTitle className="text-center white-glossy-text">
                        {user.userName} 👤
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-2">
                        <div className={`text-3xl font-bold ${user.totalAmount >= 0 ? 'white-glossy-text' : 'text-red-500'}`}>
                          ৳{Math.abs(user.totalAmount).toFixed(2)}{user.totalAmount < 0 ? ' (Debt)' : ''}
                        </div>
                        <Badge variant="secondary" className="white-glossy-button text-slate-700">
                          {user.depositCount} transactions 📝
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="white-glossy-border rounded-2xl">
              <Card className="white-glossy-card-enhanced">
                <CardHeader>
                  <CardTitle className="white-glossy-text">Recent Transactions 📋</CardTitle>
                  <CardDescription className="text-slate-600">
                    Latest deposits and withdrawals in HASHI BANK
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {deposits.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No transactions yet. Add your first deposit! 🎯
                      </p>
                    ) : (
                      deposits.map((deposit) => (
                        <div key={deposit.id} className="white-glossy-card p-3 rounded-lg shadow-sm backdrop-blur-sm border border-white/20">
                          <div>
                            <p className="font-medium text-slate-800">{deposit.userName}</p>
                            <p className="text-sm text-slate-600">
                              {deposit.month} {deposit.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${deposit.amount >= 0 ? 'white-glossy-text' : 'text-red-500'}`}>
                              {deposit.amount >= 0 ? '+' : ''}৳{Math.abs(deposit.amount).toFixed(2)}
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
            <div className="white-glossy-border rounded-2xl">
              <Card className="white-glossy-card-enhanced">
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
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input-enhanced"
                      >
                        {users.length === 0 ? (
                          <option value="">Loading users...</option>
                        ) : (
                          users.map((user) => (
                            <option key={user.id} value={user.name}>
                              {user.name}
                            </option>
                          ))
                        )}
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
                        className="white-glossy-input-enhanced placeholder-slate-400"
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
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input-enhanced"
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
                        className="white-glossy-input-enhanced placeholder-slate-400"
                      />
                    </div>
                  </div>
                  
                  {/* Confirmation Section */}
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <div className="space-y-2">
                      <Label htmlFor="confirmPin" className="text-slate-700 font-medium">Confirm with PIN</Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        placeholder="Enter your 4-digit PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        maxLength={4}
                        className="text-center white-glossy-input-enhanced placeholder-slate-400"
                      />
                      <p className="text-xs text-slate-500">Enter your PIN to authorize this deposit</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirm"
                        checked={isConfirmed}
                        onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                        className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                      />
                      <Label
                        htmlFor="confirm"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                      >
                        Are you sure? This action cannot be undone. ✅
                      </Label>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddDeposit}
                    disabled={isAddingDeposit || !confirmPin || !isConfirmed}
                    className="w-full white-glossy-button-enhanced font-bold"
                  >
                    {isAddingDeposit ? "Adding Deposit..." : "Add Deposit 🚀"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <div className="white-glossy-border rounded-2xl">
              <Card className="white-glossy-card-enhanced">
                <CardHeader>
                  <CardTitle className="white-glossy-text">Process Withdrawal 💸</CardTitle>
                  <CardDescription className="text-slate-600">
                    Withdraw money from HASHI BANK
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalUserName" className="text-slate-700">User Name</Label>
                      <select
                        id="withdrawalUserName"
                        value={newWithdrawal.userName}
                        onChange={(e) => setNewWithdrawal({
                          ...newWithdrawal,
                          userName: e.target.value
                        })}
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input-enhanced"
                      >
                        {users.length === 0 ? (
                          <option value="">Loading users...</option>
                        ) : (
                          users.map((user) => (
                            <option key={user.id} value={user.name}>
                              {user.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalAmount" className="text-slate-700">Amount (৳)</Label>
                      <Input
                        id="withdrawalAmount"
                        type="number"
                        placeholder="Enter amount to withdraw"
                        value={newWithdrawal.amount}
                        onChange={(e) => setNewWithdrawal({
                          ...newWithdrawal,
                          amount: e.target.value
                        })}
                        className="white-glossy-input-enhanced placeholder-slate-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalMonth" className="text-slate-700">Month</Label>
                      <select
                        id="withdrawalMonth"
                        value={newWithdrawal.month}
                        onChange={(e) => setNewWithdrawal({
                          ...newWithdrawal,
                          month: e.target.value
                        })}
                        className="w-full p-2 border border-white/30 rounded-md white-glossy-input-enhanced"
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
                      <Label htmlFor="withdrawalYear" className="text-slate-700">Year</Label>
                      <Input
                        id="withdrawalYear"
                        type="number"
                        placeholder="Year"
                        value={newWithdrawal.year}
                        onChange={(e) => setNewWithdrawal({
                          ...newWithdrawal,
                          year: e.target.value
                        })}
                        className="white-glossy-input-enhanced placeholder-slate-400"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawalConfirmPin" className="text-slate-700">Confirm PIN</Label>
                      <Input
                        id="withdrawalConfirmPin"
                        type="password"
                        placeholder="Enter 4-digit PIN"
                        value={withdrawalConfirmPin}
                        onChange={(e) => setWithdrawalConfirmPin(e.target.value)}
                        maxLength={4}
                        className="text-center white-glossy-input-enhanced placeholder-slate-400"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="withdrawalConfirm"
                        checked={isWithdrawalConfirmed}
                        onCheckedChange={(checked) => setIsWithdrawalConfirmed(checked as boolean)}
                      />
                      <Label htmlFor="withdrawalConfirm" className="text-slate-700">
                        Are you sure? This action cannot be undone.
                      </Label>
                    </div>
                    
                    <Button 
                      onClick={handleWithdrawal} 
                      disabled={isWithdrawing}
                      className="w-full white-glossy-button-enhanced font-bold"
                    >
                      {isWithdrawing ? "Processing..." : "Process Withdrawal 💸"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Shimmer Effect */}
      <div className="white-glossy-shimmer"></div>
    </div>
  )
}