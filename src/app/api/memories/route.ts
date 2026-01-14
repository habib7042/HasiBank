import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      include: {
        user: {
          select: { name: true }
        },
        images: true,
        comments: {
          include: {
            user: {
              select: { name: true }
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

    // Normalize data structure for backward compatibility or easier frontend consumption
    // If imageUrl exists but no images array, populate it (migration helper logic if needed)

    return NextResponse.json({ memories })
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
