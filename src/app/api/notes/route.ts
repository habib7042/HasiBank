import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: {
        user: {
          select: { name: true }
        },
        reactions: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, userName, emoji } = body

    if (!content || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const note = await prisma.note.create({
      data: {
        content,
        userId: user.id,
        emoji: emoji || null
      },
      include: {
        user: {
          select: { name: true }
        },
        reactions: true
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
