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

    const where: Prisma.MemoryWhereInput = {}

    if (filterUser) {
      where.user = { name: filterUser }
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        // Adjust end date to include the full day
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.date.lte = end
      }
    }

    const memories = await prisma.memory.findMany({
      where,
      skip,
      take: limit,
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
      },
      orderBy: {
        date: 'desc'
      }
    })

    const total = await prisma.memory.count({ where })

    return NextResponse.json({
      memories,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    })
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Support legacy single imageUrl and new images array
    const { description, date, imageUrl, images, userName } = body

    if (!description || !date || (!imageUrl && (!images || images.length === 0)) || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare images data
    const imagesToCreate = images && Array.isArray(images)
      ? images.map((url: string) => ({ url }))
      : imageUrl ? [{ url: imageUrl }] : []

    const memory = await prisma.memory.create({
      data: {
        description,
        date: new Date(date),
        imageUrl: imageUrl || null, // Keep legacy field populated if single image
        userId: user.id,
        images: {
          create: imagesToCreate
        }
      },
      include: {
        user: {
          select: { name: true }
        },
        images: true,
        comments: true
      }
    })

    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error creating memory:', error)
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}
