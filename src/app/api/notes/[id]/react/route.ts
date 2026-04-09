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
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId: user.id
        }
      }
    })

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off if same type
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        })
        return NextResponse.json({ action: 'removed' })
      } else {
        // Update type if different
        const reaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type }
        })
        return NextResponse.json({ action: 'updated', reaction })
      }
    } else {
      // Create new reaction
      const reaction = await prisma.reaction.create({
        data: {
          noteId,
          userId: user.id,
          type
        }
      })
      return NextResponse.json({ action: 'created', reaction })
    }

  } catch (error) {
    console.error('Error handling reaction:', error)
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 })
  }
}
