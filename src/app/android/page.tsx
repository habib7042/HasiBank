'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Home, History, PlusCircle, Settings, Smartphone, ArrowUpCircle, ArrowDownCircle, RefreshCw, Power, Database } from 'lucide-react'

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

export default function AndroidApp() {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  // Data States
  const [userTotals, setUserTotals] = useState<UserTotal[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Action Forms
  const [actionType, setActionType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [newTransaction, setNewTransaction] = useState({
    userName: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const [confirmPin, setConfirmPin] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = () => {
    loadTotals()
    loadDeposits()
    loadUsers()
    loadSystemInfo()
  }

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
        if (!newTransaction.userName && data.users.length > 0) {
          setNewTransaction(prev => ({
            ...prev,
            userName: data.users[0].name
          }))
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadSystemInfo = async () => {
    try {
      const healthRes = await fetch('/api/health')
      if (healthRes.ok) setHealthStatus(await healthRes.json())

      const debugRes = await fetch('/api/debug')
      if (debugRes.ok) setDebugInfo(await debugRes.json())
    } catch (error) {
      console.error('Error loading system info:', error)
    }
  }

  const handleLogin = async () => {
    if (!pin) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        toast({ title: "Welcome back!", description: "Logged in to Hashi Bank Mobile" })
        setIsAuthenticated(true)
        loadUsers() // Load initially to populate dropdowns
      } else {
        toast({ title: "Invalid PIN", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransaction = async () => {
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" })
      return
    }
    if (!confirmPin || confirmPin.length !== 4) {
      toast({ title: "PIN Required", variant: "destructive" })
      return
    }
    if (!isConfirmed) {
      toast({ title: "Confirmation Required", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    try {
      // Verify PIN
      const pinResponse = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: confirmPin }),
      })

      if (!pinResponse.ok) {
        toast({ title: "Invalid PIN", variant: "destructive" })
        setIsProcessing(false)
        return
      }

      const endpoint = actionType === 'deposit' ? '/api/deposits' : '/api/withdrawals'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${actionType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`
        })
        setNewTransaction({ ...newTransaction, amount: '' })
        setConfirmPin('')
        setIsConfirmed(false)
        loadData()
        setActiveTab('history')
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Transaction failed", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitDb = async () => {
    try {
      const response = await fetch('/api/init', { method: 'POST' })
      if (response.ok) {
        toast({ title: "Database Initialized", description: "Default users created." })
        loadUsers()
      }
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-blue-900 opacity-50 z-0"></div>

        <div className="z-10 w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-xl mb-4">
            <Smartphone className="w-12 h-12 text-cyan-400" />
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Hashi Mobile
          </h1>
          <p className="text-slate-400">Enter your PIN to access</p>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="text-center text-3xl tracking-widest bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-16 rounded-2xl"
            />

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl text-lg font-semibold shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
            >
              {isLoading ? "Verifying..." : "Unlock"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      {/* Mobile Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 pt-safe sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
          Hashi Bank
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
             Mobile v1.0
          </Badge>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 scroll-smooth">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Bank Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-xl shadow-blue-200">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl"></div>

              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Bank Balance</p>
                <h2 className="text-4xl font-bold mb-6">৳{Math.abs(bankTotal).toFixed(2)}</h2>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100 text-xs">Status</p>
                    <p className="font-semibold">{bankTotal >= 0 ? 'Healthy' : 'In Debt'}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* User Cards Grid */}
            <h3 className="font-bold text-slate-700 text-lg">User Accounts</h3>
            <div className="grid grid-cols-1 gap-4">
              {userTotals.map((user) => (
                <div key={user.userName} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user.userName}</p>
                      <p className="text-xs text-slate-500">{user.depositCount} Transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${user.totalAmount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      ৳{Math.abs(user.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Transactions</h2>
              <Button variant="ghost" size="sm" onClick={loadDeposits} className="h-8 w-8 p-0 rounded-full">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {deposits.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                No transactions found
              </div>
            ) : (
              deposits.map((deposit) => (
                <div key={deposit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${deposit.amount >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {deposit.amount >= 0 ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-bold text-slate-800">{deposit.userName}</p>
                      <p className={`font-bold ${deposit.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {deposit.amount > 0 ? '+' : ''}৳{deposit.amount}
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{deposit.month} {deposit.year}</span>
                      <span>{new Date(deposit.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTION TAB */}
        {activeTab === 'action' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActionType('deposit')}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${actionType === 'deposit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActionType('withdrawal')}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${actionType === 'withdrawal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Withdraw
              </button>
            </div>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <select
                    className="w-full p-3 bg-slate-50 border-0 rounded-xl font-medium"
                    value={newTransaction.userName}
                    onChange={(e) => setNewTransaction({...newTransaction, userName: e.target.value})}
                  >
                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                    <Input
                      type="number"
                      className="pl-8 bg-slate-50 border-0 h-12 rounded-xl text-lg font-bold"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <select
                      className="w-full p-3 bg-slate-50 border-0 rounded-xl"
                      value={newTransaction.month}
                      onChange={(e) => setNewTransaction({...newTransaction, month: e.target.value})}
                    >
                      {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      className="bg-slate-50 border-0 h-12 rounded-xl"
                      value={newTransaction.year}
                      onChange={(e) => setNewTransaction({...newTransaction, year: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <Label>Confirm PIN</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      className="text-center bg-slate-50 border-0 h-12 rounded-xl tracking-widest text-lg"
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirm"
                      checked={isConfirmed}
                      onCheckedChange={(c) => setIsConfirmed(c as boolean)}
                    />
                    <Label htmlFor="confirm" className="text-xs text-slate-500">I verify this transaction is correct</Label>
                  </div>

                  <Button
                    className={`w-full h-12 rounded-xl font-bold shadow-lg shadow-cyan-900/10 ${actionType === 'deposit' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-rose-500 hover:bg-rose-600'}`}
                    onClick={handleTransaction}
                    disabled={isProcessing || !isConfirmed || !confirmPin}
                  >
                    {isProcessing ? 'Processing...' : (actionType === 'deposit' ? 'Add Deposit' : 'Withdraw Funds')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xl font-bold text-slate-800">System</h2>

             <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
               <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="font-semibold text-slate-700">Health Status</h3>
               </div>
               <div className="p-4 space-y-2">
                 <div className="flex justify-between">
                   <span className="text-slate-500">API Status</span>
                   <Badge className={healthStatus?.message === 'Good!' ? 'bg-emerald-500' : 'bg-rose-500'}>
                     {healthStatus?.message || 'Unknown'}
                   </Badge>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-500">Database</span>
                   <span className="text-slate-700 font-medium">{debugInfo?.database?.success ? 'Connected' : 'Disconnected'}</span>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
               <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="font-semibold text-slate-700">Actions</h3>
               </div>
               <div className="p-4 space-y-4">
                 <Button variant="outline" className="w-full justify-start gap-2" onClick={handleInitDb}>
                   <Database className="w-4 h-4" />
                   Initialize Database
                 </Button>
                 <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => setIsAuthenticated(false)}>
                   <Power className="w-4 h-4" />
                   Logout
                 </Button>
               </div>
             </div>

             {debugInfo && (
                <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-slate-400 overflow-x-auto">
                  <p className="mb-2 text-slate-200 font-bold">Debug Info:</p>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
             )}
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 pb-safe pt-2 px-6 fixed bottom-0 w-full z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-cyan-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-cyan-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </button>

          <button
            onClick={() => setActiveTab('action')}
            className="flex flex-col items-center -mt-8"
          >
            <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all ${activeTab === 'action' ? 'bg-cyan-600 text-white scale-110 shadow-cyan-600/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className={`text-[10px] font-medium mt-1 ${activeTab === 'action' ? 'text-cyan-600' : 'text-slate-400'}`}>Action</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-cyan-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">System</span>
          </button>
        </div>
      </nav>
    </div>
  )
}