import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get('userName')

    if (!userName) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const secrets = await prisma.totpSecret.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

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

    if (!label || !secret || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate secret is base32? For now assuming simple string storage.
    // Clean secret (remove spaces)
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase()

    const newSecret = await prisma.totpSecret.create({
      data: {
        label,
        secret: cleanSecret,
        issuer: issuer || 'Unknown',
        userId: user.id
      }
    })

    return NextResponse.json({ secret: newSecret })
  } catch (error) {
    console.error('Error creating TOTP secret:', error)
    return NextResponse.json({ error: 'Failed to create secret' }, { status: 500 })
  }
}
