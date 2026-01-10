import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Users, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react'

interface UserTotal {
  userName: string
  totalAmount: number
  depositCount: number
}

interface OverviewProps {
  bankTotal: number
  userTotals: UserTotal[]
}

export function Overview({ bankTotal, userTotals }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${bankTotal < 0 ? 'text-red-500' : ''}`}>
              ৳{Math.abs(bankTotal).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bankTotal >= 0 ? 'Total savings across all accounts' : 'Total debt across all accounts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTotals.length}</div>
            <p className="text-xs text-muted-foreground">
              Members saving together
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userTotals.map((user) => (
          <Card key={user.userName} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
              <CardTitle className="text-base font-medium">{user.userName}</CardTitle>
              <CreditCard className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${user.totalAmount < 0 ? 'text-red-500' : ''}`}>
                    ৳{Math.abs(user.totalAmount).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current Balance
                  </p>
                </div>
                <Badge variant="secondary" className="h-fit">
                  {user.depositCount} txns
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
