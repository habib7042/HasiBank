import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const locations = await prisma.locationPin.findMany({
      include: {
        user: { select: { name: true } }
      }
    })
    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, userName } = body

    if (!name || !userName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { name: userName } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const location = await prisma.locationPin.upsert({
      where: { userId: user.id },
      update: { name },
      create: { name, userId: user.id }
    })

    return NextResponse.json(location)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
