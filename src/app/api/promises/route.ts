import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const promises = await prisma.promise.findMany({
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json({ promises })
  } catch (error) {
    console.error('Error fetching promises:', error)
    return NextResponse.json({ error: 'Failed to fetch promises' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    const promise = await prisma.promise.create({
      data: {
        content,
        userId: user.id,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ promise })
  } catch (error) {
    console.error('Error creating promise:', error)
    return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 })
  }
}
