import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Create users if they don't exist
    const users = [
      { name: 'Habib' },
      { name: 'Shitu' }
    ]

    for (const userData of users) {
      const existingUser = await db.user.findFirst({
        where: { name: userData.name }
      })

      if (!existingUser) {
        await db.user.create({
          data: userData
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Users initialized successfully',
      users: users.map(u => u.name)
    })
  } catch (error) {
    console.error('User initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}