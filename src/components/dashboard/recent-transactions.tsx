import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

interface Deposit {
  id: string
  amount: number
  month: string
  year: string
  userName: string
  createdAt: string
}

interface RecentTransactionsProps {
  transactions: Deposit[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-pink-100 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-pink-900 flex items-center gap-2">
          Recent Activities <Sparkles className="h-4 w-4 text-pink-500" />
        </CardTitle>
        <CardDescription className="text-pink-600/80">
          Latest deposits and withdrawals from the family.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-pink-400">
            No transactions found. Start saving! 💖
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-pink-100 hover:bg-pink-50/50">
                <TableHead className="text-pink-700">User</TableHead>
                <TableHead className="text-pink-700">Type</TableHead>
                <TableHead className="text-pink-700">Period</TableHead>
                <TableHead className="text-pink-700">Date</TableHead>
                <TableHead className="text-right text-pink-700">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const isDeposit = transaction.amount >= 0
                return (
                  <TableRow key={transaction.id} className="border-pink-100 hover:bg-pink-50/50">
                    <TableCell className="font-medium text-pink-900">{transaction.userName}</TableCell>
                    <TableCell>
                      <Badge variant={isDeposit ? "default" : "destructive"} className={isDeposit ? "bg-pink-500 hover:bg-pink-600" : "bg-red-500 hover:bg-red-600"}>
                        {isDeposit ? (
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" /> Deposit
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3" /> Withdrawal
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-pink-700">{transaction.month} {transaction.year}</TableCell>
                    <TableCell className="text-pink-500 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${isDeposit ? 'text-pink-600' : 'text-red-500'}`}>
                      {isDeposit ? '+' : ''}৳{Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
