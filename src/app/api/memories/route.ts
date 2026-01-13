import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ memories })
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { description, date, imageUrl, userName } = body

    if (!description || !date || !imageUrl || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const memory = await prisma.memory.create({
      data: {
        description,
        date: new Date(date),
        imageUrl,
        userId: user.id
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error creating memory:', error)
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}
