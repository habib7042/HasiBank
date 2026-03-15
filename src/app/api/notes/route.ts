import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const filterUser = searchParams.get('filterUser')

    const skip = (page - 1) * limit

    const where: Prisma.NoteWhereInput = {}

    if (filterUser) {
      where.user = { name: filterUser }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        // Adjust end date to include the full day
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const notes = await prisma.note.findMany({
      where,
      skip,
      take: limit,
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
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.note.count({ where })

    return NextResponse.json({
      notes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    })
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
        reactions: true,
        comments: true
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
