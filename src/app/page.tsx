'use client'

import { useState, useEffect, useRef } from 'react'
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
import { IdentityGate } from '@/components/dashboard/identity/identity-gate'
import { CodePage } from '@/components/dashboard/code/code-page'
import { ContactBook } from '@/components/dashboard/contacts/contact-book'
import { FloatingWhatsApp } from '@/components/dashboard/ui/floating-whatsapp'
import { AppIcon } from '@/components/dashboard/ui/app-icon'
import { PageHeader } from '@/components/dashboard/ui/page-header'
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  BookHeart,
  Image as ImageIcon,
  Key,
  CreditCard,
  Settings,
  Contact
} from 'lucide-react'
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

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

type View = 'home' | 'overview' | 'deposit' | 'withdraw' | 'notebook' | 'memories' | 'code' | 'contacts'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('home')
  const [isLoading, setIsLoading] = useState(false)

  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const { toast } = useToast()
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentView('home')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('lastActivity')
    sessionStorage.clear()
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current)
  }

  const updateActivity = () => {
    if (isAuthenticated) {
      localStorage.setItem('lastActivity', Date.now().toString())
      resetInactivityTimer()
    }
  }

  const resetInactivityTimer = () => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current)

    if (isAuthenticated) {
      activityTimerRef.current = setTimeout(() => {
        handleLogout()
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive"
        })
      }, INACTIVITY_TIMEOUT)
    }
  }

  useEffect(() => {
    // Check local storage for persistent login
    const savedAuth = localStorage.getItem('isAuthenticated')
    const lastActivity = localStorage.getItem('lastActivity')

    if (savedAuth === 'true') {
      // Check if session expired while closed
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceActivity > INACTIVITY_TIMEOUT) {
          handleLogout()
          setIsInitialLoading(false)
          return
        }
      }

      setIsAuthenticated(true)
      updateActivity() // Refresh activity on load
      setIsInitialLoading(false)
    } else {
      const timer = setTimeout(() => {
        setIsInitialLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const handleActivity = () => updateActivity()

    events.forEach(event => window.addEventListener(event, handleActivity))
    resetInactivityTimer() // Start timer

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current)
    }
  }, [isAuthenticated])

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
        localStorage.setItem('isAuthenticated', 'true')
        updateActivity()
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
        setCurrentView('home') // Return to home on success
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
        setCurrentView('home') // Return to home on success
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
    <div className="min-h-screen relative pb-6 md:pb-0">
      <LoveBackground />
      <Header onLogout={handleLogout} />
      
      <main className="container mx-auto p-4 md:p-6 max-w-7xl relative z-10">

        {/* Home Screen Grid */}
        {currentView === 'home' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-pink-900 mb-6 text-center md:text-left">Dashboard</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8 justify-items-center">
              <AppIcon
                icon={LayoutDashboard}
                label="Overview"
                onClick={() => setCurrentView('overview')}
                gradient="from-blue-400 to-indigo-500"
              />
              <AppIcon
                icon={PlusCircle}
                label="Deposit"
                onClick={() => setCurrentView('deposit')}
                gradient="from-emerald-400 to-green-500"
              />
              <AppIcon
                icon={MinusCircle}
                label="Withdraw"
                onClick={() => setCurrentView('withdraw')}
                gradient="from-orange-400 to-red-500"
              />
              <AppIcon
                icon={BookHeart}
                label="KothaBank"
                onClick={() => setCurrentView('notebook')}
                gradient="from-pink-400 to-rose-500"
              />
              <AppIcon
                icon={ImageIcon}
                label="Memories"
                onClick={() => setCurrentView('memories')}
                gradient="from-purple-400 to-fuchsia-500"
              />
              <AppIcon
                icon={Key}
                label="Code"
                onClick={() => setCurrentView('code')}
                gradient="from-slate-700 to-slate-900"
              />
              <AppIcon
                icon={Contact}
                label="Contacts"
                onClick={() => setCurrentView('contacts')}
                gradient="from-teal-400 to-cyan-500"
              />
            </div>

            {/* Quick Summary Widget could go here */}
            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm">
              <h3 className="text-lg font-semibold text-pink-800 mb-4">Quick Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-pink-600">Total Savings</p>
                  <p className="text-3xl font-bold text-pink-900">৳{bankTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-pink-600">Active Members</p>
                  <p className="text-2xl font-bold text-pink-900">{users.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub Pages */}
        {currentView !== 'home' && (
          <div className="animate-in slide-in-from-right-10 duration-300">
            {currentView === 'overview' && (
              <>
                <PageHeader title="Overview" onBack={() => setCurrentView('home')} />
                <Overview bankTotal={bankTotal} userTotals={userTotals} />
                <div className="mt-6">
                  <RecentTransactions transactions={deposits} />
                </div>
              </>
            )}

            {currentView === 'deposit' && (
              <>
                <PageHeader title="Add Deposit" onBack={() => setCurrentView('home')} />
                <DepositForm
                  users={users}
                  onDeposit={handleDeposit}
                  isLoading={isLoading}
                />
              </>
            )}

            {currentView === 'withdraw' && (
              <>
                <PageHeader title="Withdraw Funds" onBack={() => setCurrentView('home')} />
                <WithdrawalForm
                  users={users}
                  onWithdraw={handleWithdrawal}
                  isLoading={isLoading}
                />
              </>
            )}

            {currentView === 'notebook' && (
              <>
                <PageHeader title="KothaBank" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="kothabank"
                  title="KothaBank Locked"
                  description="Enter PIN to access messages"
                >
                  <IdentityGate users={users} gateId="kothabank-identity" title="Who is accessing KothaBank?">
                    {(selectedUser) => (
                      <Notebook users={users} currentUser={selectedUser} />
                    )}
                  </IdentityGate>
                </PinGate>
              </>
            )}

            {currentView === 'memories' && (
              <>
                <PageHeader title="Memories" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="memories"
                  title="Memories Vault"
                  description="Enter PIN to unlock photos"
                >
                   <IdentityGate users={users} gateId="memories-identity" title="Who is viewing Memories?">
                    {(selectedUser) => (
                      <Memories
                        currentUser={selectedUser}
                        users={users}
                      />
                    )}
                  </IdentityGate>
                </PinGate>
              </>
            )}

            {currentView === 'code' && (
              <>
                <PageHeader title="Authenticator" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="code"
                  title="Authenticator Locked"
                  description="Enter PIN to access 2FA codes"
                >
                  <CodePage currentUser={currentUser} />
                </PinGate>
              </>
            )}

            {currentView === 'contacts' && (
              <>
                <PageHeader title="Contact Book" onBack={() => setCurrentView('home')} />
                <IdentityGate users={users} gateId="contacts-identity" title="Who is adding this contact?">
                  {(selectedUser) => (
                    <ContactBook currentUser={selectedUser} />
                  )}
                </IdentityGate>
              </>
            )}
          </div>
        )}
      </main>
      <FloatingWhatsApp />
    </div>
  )
}
