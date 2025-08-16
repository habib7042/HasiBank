import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all users from the database
    const users = await db.user.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      users: users.map(user => ({
        id: user.id,
        name: user.name
      }))
    })
  } catch (error) {
    console.error('Users retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}