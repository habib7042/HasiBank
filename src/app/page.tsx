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
import { Notebook } from '@/components/dashboard/notebook/notebook'
import { Memories } from '@/components/dashboard/memories/memories'
import { PinGate } from '@/components/dashboard/pin-gate'
import { LayoutDashboard, PlusCircle, MinusCircle, BookHeart, Image as ImageIcon } from 'lucide-react'
import { LoadingScreen } from '@/components/ui/loading-screen'

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
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate initial app loading for animation
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

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
        setCurrentUser(data.userName)
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
      throw error
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
        setCurrentUser(data.userName)
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
      throw error
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

  if (isInitialLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoveBackground />
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />
      </>
    )
  }

  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      <LoveBackground />
      <Header onLogout={() => setIsAuthenticated(false)} />
      
      <main className="container mx-auto p-4 md:p-6 max-w-7xl relative z-10">
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-pink-100 p-2 md:hidden safe-area-pb">
            <TabsList className="grid w-full grid-cols-5 h-auto bg-transparent p-0 gap-1">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 rounded-lg transition-all"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="scale-75 truncate w-full text-center">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="deposit"
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 rounded-lg transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                <span className="scale-75 truncate w-full text-center">Deposit</span>
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 rounded-lg transition-all"
              >
                <MinusCircle className="h-5 w-5" />
                <span className="scale-75 truncate w-full text-center">Withdraw</span>
              </TabsTrigger>
              <TabsTrigger
                value="notebook"
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 rounded-lg transition-all"
              >
                <BookHeart className="h-5 w-5" />
                <span className="scale-75 truncate w-full text-center">KothaBank</span>
              </TabsTrigger>
              <TabsTrigger
                value="memories"
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:text-pink-600 data-[state=active]:bg-pink-50 rounded-lg transition-all"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="scale-75 truncate w-full text-center">Memories</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Top Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-5 lg:w-[750px] bg-white/50 backdrop-blur-sm border-white/20">
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
              <TabsTrigger value="notebook" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
                <BookHeart className="h-4 w-4" />
                KothaBank
              </TabsTrigger>
              <TabsTrigger value="memories" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
                <ImageIcon className="h-4 w-4" />
                Memories
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <Overview bankTotal={bankTotal} userTotals={userTotals} />
            <RecentTransactions transactions={deposits} />
          </TabsContent>

          <TabsContent value="deposit" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <DepositForm
              users={users}
              onDeposit={handleDeposit}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="withdraw" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <WithdrawalForm
              users={users}
              onWithdraw={handleWithdrawal}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="notebook" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <PinGate title="KothaBank Locked" description="Enter PIN to access messages">
               <Notebook
                 currentUser={currentUser}
                 users={users}
               />
            </PinGate>
          </TabsContent>

          <TabsContent value="memories" className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <PinGate title="Memories Vault" description="Enter PIN to unlock photos">
              <Memories
                currentUser={currentUser}
                users={users}
              />
            </PinGate>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
