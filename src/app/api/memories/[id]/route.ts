import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const memoryId = parseInt(id)

    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
      include: {
        user: {
          select: { name: true }
        },
        images: true,
        comments: {
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
            createdAt: 'asc'
          }
        }
      }
    })

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error fetching memory:', error)
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const memoryId = parseInt(id)
    const body = await request.json()
    const { description } = body

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const memory = await prisma.memory.update({
      where: { id: memoryId },
      data: { description }
    })

    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error updating memory:', error)
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}
