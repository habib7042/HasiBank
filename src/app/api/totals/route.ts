import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = await db.user.findMany()

    // Calculate totals for each user
    const userTotals = await Promise.all(
      users.map(async (user) => {
        const deposits = await db.deposit.findMany({
          where: { userId: user.id }
        })
        
        const totalAmount = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
        
        return {
          userName: user.name,
          totalAmount,
          depositCount: deposits.length
        }
      })
    )

    // Calculate bank total
    const bankTotal = userTotals.reduce((sum, user) => sum + user.totalAmount, 0)

    return NextResponse.json({ 
      success: true, 
      userTotals,
      bankTotal,
      totalUsers: users.length
    })
  } catch (error) {
    console.error('Totals calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}