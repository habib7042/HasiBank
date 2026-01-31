import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, number, isActive, userName } = body

    if (!name || !number || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Since it's a shared app, we attach to the first user found if userName provided,
    // or just find the user to link the record.
    const user = await prisma.user.findUnique({
      where: { name: userName }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        number,
        isActive: isActive ?? true,
        userId: user.id
      }
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
