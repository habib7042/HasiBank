import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface User {
  id: string
  name: string
}

interface WithdrawalData {
  userName: string
  amount: string
  month: string
  year: string
}

interface WithdrawalFormProps {
  users: User[]
  onWithdraw: (data: WithdrawalData, pin: string) => Promise<void>
  isLoading: boolean
}

export function WithdrawalForm({ users, onWithdraw, isLoading }: WithdrawalFormProps) {
  const [data, setData] = useState<WithdrawalData>({
    userName: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString()
  })
  const [pin, setPin] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onWithdraw(data, pin)
      .then(() => {
        // Reset form on success
        setData({
          ...data,
          amount: ''
        })
        setPin('')
        setIsConfirmed(false)
      })
      .catch(() => {
        // Error handling is done in parent
      })
  }

  // Set default user if available and not set
  if (!data.userName && users.length > 0) {
    setData(prev => ({ ...prev, userName: users[0].name }))
  }

  return (
    <Card className="max-w-2xl mx-auto border-red-100">
      <CardHeader>
        <CardTitle className="text-red-700">Process Withdrawal</CardTitle>
        <CardDescription>
          Record a new withdrawal for a member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userName">Member</Label>
              <Select
                value={data.userName}
                onValueChange={(value) => setData({ ...data, userName: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={data.month}
                onValueChange={(value) => setData({ ...data, month: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={data.year}
                onChange={(e) => setData({ ...data, year: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-4 border border-red-100 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-red-900">Authorization PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="font-mono text-center tracking-widest max-w-[200px] border-red-200 focus-visible:ring-red-500"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm"
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                required
                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="confirm" className="text-sm font-normal text-red-800">
                I confirm this withdrawal is authorized and funds are being released.
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={isLoading || !isConfirmed || pin.length < 4}
          >
            {isLoading ? "Processing..." : "Process Withdrawal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
