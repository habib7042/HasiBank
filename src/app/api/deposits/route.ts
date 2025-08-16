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

    // Create the deposit
    const deposit = await db.deposit.create({
      data: {
        amount: parseFloat(amount),
        month,
        year,
        userId: user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit added successfully',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        month: deposit.month,
        year: deposit.year,
        userName: user.name
      }
    })
  } catch (error) {
    console.error('Deposit creation error:', error)
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
    const where: any = {}
    
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

    // Get deposits with user information
    const deposits = await db.deposit.findMany({
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
      deposits: deposits.map(d => ({
        id: d.id,
        amount: d.amount,
        month: d.month,
        year: d.year,
        userName: d.user.name,
        createdAt: d.createdAt
      }))
    })
  } catch (error) {
    console.error('Depposits retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}