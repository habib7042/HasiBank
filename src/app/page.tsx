'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { LoginForm } from '@/components/dashboard/login-form'
import { Header } from '@/components/dashboard/header'
import { Overview } from '@/components/dashboard/overview'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { DepositForm } from '@/components/dashboard/deposit-form'
import { WithdrawalForm } from '@/components/dashboard/withdrawal-form'
import { LayoutDashboard, PlusCircle, MinusCircle, Heart } from 'lucide-react'

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

interface TransactionData {
  userName: string
  amount: string
  month: string
  year: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
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
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleLogin = async (pin: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        toast({
          title: "Access Granted",
          description: "Welcome to Hashi Bank Dashboard.",
        })
        setIsAuthenticated(true)
        await fetch('/api/init', { method: 'POST' })
        loadUsers()
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid security PIN provided.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "System Error",
        description: "Unable to verify credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPin = async (pin: string) => {
    const response = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    return response.ok
  }

  const handleDeposit = async (data: TransactionData, pin: string) => {
    setIsLoading(true)
    try {
      const isPinValid = await verifyPin(pin)
      if (!isPinValid) {
        throw new Error('Invalid authorization PIN')
      }

      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Deposit Successful",
          description: `Successfully added ৳${data.amount} for ${data.userName}`,
        })
        loadTotals()
        loadDeposits()
        loadUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process deposit')
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
      throw error // Re-throw to handle in component
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawal = async (data: TransactionData, pin: string) => {
    setIsLoading(true)
    try {
      const isPinValid = await verifyPin(pin)
      if (!isPinValid) {
        throw new Error('Invalid authorization PIN')
      }

      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Withdrawal Processed",
          description: `Successfully withdrew ৳${data.amount} for ${data.userName}`,
        })
        loadTotals()
        loadDeposits()
        loadUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process withdrawal')
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
      throw error // Re-throw to handle in component
    } finally {
      setIsLoading(false)
    }
  }

  // Background Animation Component
  const LoveBackground = () => (
    <div className="love-background">
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
    </div>
  )

  if (!isAuthenticated) {
    return (
      <>
        <LoveBackground />
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />
      </>
    )
  }

  return (
    <div className="min-h-screen relative">
      <LoveBackground />
      <Header onLogout={() => setIsAuthenticated(false)} />
      
      <main className="container mx-auto p-6 max-w-7xl relative z-10">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white/50 backdrop-blur-sm border-white/20">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="deposit" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
              <PlusCircle className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
              <MinusCircle className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
            <Overview bankTotal={bankTotal} userTotals={userTotals} />
            <RecentTransactions transactions={deposits} />
          </TabsContent>

          <TabsContent value="deposit" className="animate-in fade-in-50 duration-500">
            <DepositForm
              users={users}
              onDeposit={handleDeposit}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="withdraw" className="animate-in fade-in-50 duration-500">
            <WithdrawalForm
              users={users}
              onWithdraw={handleWithdrawal}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
