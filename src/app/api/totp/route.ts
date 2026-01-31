import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // Optional: filter by user if provided, otherwise fetch all (shared vault)
    const userName = searchParams.get('userName')

    let secrets;
    if (userName) {
      const user = await prisma.user.findUnique({ where: { name: userName } })
      if (user) {
        secrets = await prisma.totpSecret.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
      }
    }

    // If no user specified or found, fetch all secrets (Shared mode)
    if (!secrets) {
      secrets = await prisma.totpSecret.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ secrets })
  } catch (error) {
    console.error('Error fetching TOTP secrets:', error)
    return NextResponse.json({ error: 'Failed to fetch secrets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label, secret, issuer, userName } = body

    if (!label || !secret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Default to the first user if no userName provided (System owner)
    let userId: number;
    if (userName) {
      const user = await prisma.user.findUnique({ where: { name: userName } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      userId = user.id
    } else {
      // Find first user to attach to
      const firstUser = await prisma.user.findFirst()
      if (!firstUser) return NextResponse.json({ error: 'No users exist to own this secret' }, { status: 500 })
      userId = firstUser.id
    }

    // Clean secret (remove spaces)
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase()

    const newSecret = await prisma.totpSecret.create({
      data: {
        label,
        secret: cleanSecret,
        issuer: issuer || 'Unknown',
        userId
      }
    })

    return NextResponse.json({ secret: newSecret })
  } catch (error) {
    console.error('Error creating TOTP secret:', error)
    return NextResponse.json({ error: 'Failed to create secret' }, { status: 500 })
  }
}
