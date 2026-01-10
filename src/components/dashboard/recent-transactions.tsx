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
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

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
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Latest deposits and withdrawals from all users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No transactions found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const isDeposit = transaction.amount >= 0
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.userName}</TableCell>
                    <TableCell>
                      <Badge variant={isDeposit ? "default" : "destructive"} className={isDeposit ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
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
                    <TableCell>{transaction.month} {transaction.year}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${isDeposit ? 'text-emerald-600' : 'text-red-600'}`}>
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
