import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Users, CreditCard } from 'lucide-react'

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
        <Card className="border-pink-100 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-900">Total Assets</CardTitle>
            <Wallet className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${bankTotal < 0 ? 'text-red-500' : 'text-pink-700'}`}>
              ৳{Math.abs(bankTotal).toFixed(2)}
            </div>
            <p className="text-xs text-pink-600/80">
              {bankTotal >= 0 ? 'Total savings' : 'Total debt'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-900">Active Members</CardTitle>
            <Users className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-700">{userTotals.length}</div>
            <p className="text-xs text-pink-600/80">
              Saving together 💖
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userTotals.map((user) => (
          <Card key={user.userName} className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] border-pink-100 bg-white/70 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-pink-50/50 group-hover:bg-pink-100/50 transition-colors">
              <CardTitle className="text-base font-bold text-pink-800">{user.userName}</CardTitle>
              <CreditCard className="h-4 w-4 text-pink-400 group-hover:text-pink-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${user.totalAmount < 0 ? 'text-red-500' : 'text-pink-600'}`}>
                    ৳{Math.abs(user.totalAmount).toFixed(2)}
                  </div>
                  <p className="text-xs text-pink-500 mt-1">
                    Current Balance
                  </p>
                </div>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">
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
