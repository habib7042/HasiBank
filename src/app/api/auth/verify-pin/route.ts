import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }

    // Get the PIN from settings
    let settings = await db.settings.findFirst()

    // If no settings exist, create one with the provided PIN (initial setup)
    if (!settings) {
      settings = await db.settings.create({
        data: {
          pin: pin
        }
      })
      return NextResponse.json({ success: true, message: 'PIN set successfully' })
    }

    // Verify the PIN
    if (settings.pin === pin) {
      return NextResponse.json({ success: true, message: 'PIN verified successfully' })
    } else {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('PIN verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}