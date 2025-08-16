import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userName, amount, month, year } = await request.json()

    if (!userName || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'All fields are required: userName, amount, month, year' },
        { status: 400 }
      )
    }

    // Convert amount to negative for withdrawal
    const withdrawalAmount = -Math.abs(parseFloat(amount))

    // Find the user
    const user = await db.user.findFirst({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create the withdrawal (as a negative deposit)
    const withdrawal = await db.deposit.create({
      data: {
        amount: withdrawalAmount,
        month,
        year,
        userId: user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal processed successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        month: withdrawal.month,
        year: withdrawal.year,
        userName: user.name
      }
    })
  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get('userName')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Build the where clause
    const where: any = { amount: { lt: 0 } } // Only negative amounts (withdrawals)
    
    if (userName) {
      const user = await db.user.findFirst({
        where: { name: userName }
      })
      if (user) {
        where.userId = user.id
      }
    }
    
    if (month) {
      where.month = month
    }
    
    if (year) {
      where.year = year
    }

    // Get withdrawals with user information
    const withdrawals = await db.deposit.findMany({
      where,
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: w.amount,
        month: w.month,
        year: w.year,
        userName: w.user.name,
        createdAt: w.createdAt
      }))
    })
  } catch (error) {
    console.error('Withdrawals retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}