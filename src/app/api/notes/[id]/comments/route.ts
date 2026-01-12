import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const noteId = parseInt(id)
    const body = await request.json()
    const { content, userName } = body

    if (!content || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        noteId,
        userId: user.id
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
