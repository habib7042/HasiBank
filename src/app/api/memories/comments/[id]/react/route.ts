import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const memoryCommentId = parseInt(id)
    const body = await request.json()
    const { userName, type } = body

    if (!userName || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.memoryCommentReaction.findUnique({
      where: {
        memoryCommentId_userId: {
          memoryCommentId,
          userId: user.id
        }
      }
    })

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await prisma.memoryCommentReaction.delete({
          where: { id: existingReaction.id }
        })
        return NextResponse.json({ action: 'removed' })
      } else {
        // Update type
        const reaction = await prisma.memoryCommentReaction.update({
          where: { id: existingReaction.id },
          data: { type }
        })
        return NextResponse.json({ action: 'updated', reaction })
      }
    } else {
      // Create new
      const reaction = await prisma.memoryCommentReaction.create({
        data: {
          memoryCommentId,
          userId: user.id,
          type
        }
      })
      return NextResponse.json({ action: 'created', reaction })
    }

  } catch (error) {
    console.error('Error handling memory comment reaction:', error)
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 })
  }
}
