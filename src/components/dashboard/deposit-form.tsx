import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Keypad } from '@/components/ui/keypad'

interface User {
  id: string
  name: string
}

interface DepositData {
  userName: string
  amount: string
  month: string
  year: string
}

interface DepositFormProps {
  users: User[]
  onDeposit: (data: DepositData, pin: string) => Promise<void>
  isLoading: boolean
}

export function DepositForm({ users, onDeposit, isLoading }: DepositFormProps) {
  const [data, setData] = useState<DepositData>({
    userName: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const [pin, setPin] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showKeypad, setShowKeypad] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onDeposit(data, pin)
      .then(() => {
        // Reset form on success
        setData({
          ...data,
          amount: ''
        })
        setPin('')
        setIsConfirmed(false)
        setShowKeypad(false)
      })
      .catch(() => {
        // Error handling is done in parent
      })
  }

  // Set default user if available and not set
  if (!data.userName && users.length > 0) {
    setData(prev => ({ ...prev, userName: users[0].name }))
  }

  const handleKeyPress = (key: string) => {
    setPin(prev => prev + key)
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  return (
    <Card className="max-w-2xl mx-auto border-pink-100 bg-white/70 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-pink-800">Add Savings 💰</CardTitle>
        <CardDescription className="text-pink-600">
          Record a new deposit for a family member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-pink-700">Member</Label>
              <Select
                value={data.userName}
                onValueChange={(value) => setData({ ...data, userName: value })}
              >
                <SelectTrigger className="border-pink-200 focus:ring-pink-400">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-pink-700">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                min="0.01"
                step="0.01"
                required
                className="border-pink-200 focus-visible:ring-pink-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month" className="text-pink-700">Month</Label>
              <Select
                value={data.month}
                onValueChange={(value) => setData({ ...data, month: value })}
              >
                <SelectTrigger className="border-pink-200 focus:ring-pink-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-pink-700">Year</Label>
              <Input
                id="year"
                type="number"
                value={data.year}
                onChange={(e) => setData({ ...data, year: e.target.value })}
                required
                className="border-pink-200 focus-visible:ring-pink-400"
              />
            </div>
          </div>

          <div className="rounded-lg bg-pink-50 p-4 border border-pink-100 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-pink-800">Authorization PIN</Label>
              <Input
                id="pin"
                type="password"
                autoComplete="off"
                placeholder="Tap to enter PIN"
                value={pin}
                readOnly
                onClick={() => setShowKeypad(!showKeypad)}
                className="font-mono text-center tracking-widest max-w-[200px] border-pink-200 focus-visible:ring-pink-400 bg-white cursor-pointer"
                required
              />
            </div>

            {showKeypad && (
              <div className="bg-white p-2 rounded-xl border border-pink-100 shadow-sm">
                <Keypad
                  onKeyPress={handleKeyPress}
                  onDelete={handleDelete}
                  currentLength={pin.length}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm"
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                required
                className="border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
              />
              <Label htmlFor="confirm" className="text-sm font-normal text-pink-700">
                I confirm that I have received this amount and authorized this deposit.
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold"
            disabled={isLoading || !isConfirmed || pin.length < 4}
          >
            {isLoading ? "Processing..." : "Confirm Deposit 💖"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
