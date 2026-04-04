'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { LoginForm } from '@/components/dashboard/login-form'
import { SecurityQuestion } from '@/components/dashboard/security-question'
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
import Script from 'next/script'
import { PromiseManager } from '@/components/dashboard/promises/promises-manager'
import { PrioDakManager } from '@/components/prio-dak-manager'
import { ChatRoom } from '@/components/dashboard/chat/chat-room'
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
  Contact,
  ShieldCheck,
  HeartHandshake,
  MessageCircleHeart
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

const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes strict

type View = 'home' | 'overview' | 'deposit' | 'withdraw' | 'notebook' | 'memories' | 'code' | 'contacts' | 'promises' | 'priodak' | 'chat'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSecurityVerified, setIsSecurityVerified] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('home')
  const [isLoading, setIsLoading] = useState(false)

  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const { toast } = useToast()
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsSecurityVerified(false)
    setCurrentView('home')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('isSecurityVerified')
    sessionStorage.clear()
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
  }

  // Strict Session Timer & Visibility Handler
  useEffect(() => {
    if (!isAuthenticated) return

    // 1. Strict 5-minute session timer
    sessionTimerRef.current = setTimeout(() => {
      handleLogout()
      toast({
        title: "Session Expired",
        description: "Your session has timed out for security.",
        variant: "destructive"
      })
    }, SESSION_TIMEOUT)

    // 2. Logout on minimize/hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleLogout()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Check local storage for persistent login
    const savedAuth = localStorage.getItem('isAuthenticated')
    const savedSecCheck = localStorage.getItem('isSecurityVerified')

    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      if (savedSecCheck === 'true') {
        setIsSecurityVerified(true)
      }
      setIsInitialLoading(false)
    } else {
      const timer = setTimeout(() => {
        setIsInitialLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && isSecurityVerified) {
      loadTotals()
      loadDeposits()
      loadUsers()
    }
  }, [isAuthenticated, isSecurityVerified])

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
          title: "PIN Verified",
          description: "Proceeding to security check...",
        })
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        await fetch('/api/init', { method: 'POST' })
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid security PIN.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "System Error",
        description: "Unable to verify credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecuritySuccess = () => {
    setIsSecurityVerified(true)
    localStorage.setItem('isSecurityVerified', 'true')
    toast({
      title: "Welcome Back!",
      description: "Identity confirmed.",
    })
    loadUsers()
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
        setCurrentView('home')
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
        setCurrentView('home')
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

  // Background Animation Component - Only for authenticated view
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

  const TawkToScript = () => (
    <Script id="tawk-to" strategy="lazyOnload">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/69d14f099680621c337898ca/1jlcppg74';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  )

  if (isInitialLoading) {
    return <LoadingScreen />
  }

  // 1. Not Authenticated -> Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
        <TawkToScript />
        {/* Abstract Professional Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <LoginForm onLogin={handleLogin} isLoading={isLoading} />

        <footer className="absolute bottom-4 text-center text-slate-400 text-xs">
           © {new Date().getFullYear()} Hashi Bank. Secure. Reliable.
        </footer>
      </div>
    )
  }

  // 2. Authenticated but Security Check Failed -> Security Question
  if (!isSecurityVerified) {
    return (
      <>
        <TawkToScript />
        <SecurityQuestion onSuccess={handleSecuritySuccess} />
      </>
    )
  }

  // 3. Fully Authenticated -> Dashboard
  return (
    <div className="min-h-screen relative pb-6 md:pb-0">
      <TawkToScript />
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
              <AppIcon
                icon={ShieldCheck}
                label="Promises"
                onClick={() => setCurrentView('promises')}
                gradient="from-yellow-400 to-amber-500"
              />
              <AppIcon
                icon={HeartHandshake}
                label="PrioDak"
                onClick={() => setCurrentView('priodak')}
                gradient="from-rose-400 to-pink-600"
              />
              <AppIcon
                icon={MessageCircleHeart}
                label="যোগাযোগ"
                onClick={() => setCurrentView('chat')}
                gradient="from-fuchsia-400 to-purple-600"
              />
            </div>

            {/* Quick Summary Widget */}
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

            {currentView === 'promises' && (
              <>
                <PageHeader title="Promises" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="promises"
                  title="Promises Locked"
                  description="Enter PIN to access promises"
                >
                  <IdentityGate users={users} gateId="promises-identity" title="Who is making this promise?">
                    {(selectedUser) => (
                      <PromiseManager currentUser={selectedUser} />
                    )}
                  </IdentityGate>
                </PinGate>
              </>
            )}

            {currentView === 'priodak' && (
              <>
                <PageHeader title="PrioDak" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="priodak"
                  title="PrioDak Locked"
                  description="Enter PIN to access PrioDak"
                >
                  <IdentityGate users={users} gateId="priodak-identity" title="Who is adding this PrioDak?">
                    {(selectedUser) => (
                      <PrioDakManager currentUser={selectedUser} />
                    )}
                  </IdentityGate>
                </PinGate>
              </>
            )}

            {currentView === 'chat' && (
              <>
                <PageHeader title="যোগাযোগ" onBack={() => setCurrentView('home')} />
                <PinGate
                  gateId="chat"
                  title="Chat Locked"
                  description="Enter PIN to access secure chat"
                >
                  <IdentityGate users={users} gateId="chat-identity" title="কে চ্যাটে ঢুকছেন?">
                    {(selectedUser) => (
                      <ChatRoom currentUser={selectedUser} />
                    )}
                  </IdentityGate>
                </PinGate>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
