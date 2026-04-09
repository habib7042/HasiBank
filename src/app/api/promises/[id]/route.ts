import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    const body = await request.json()
    const { isActive } = body

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const promise = await prisma.promise.update({
      where: { id },
      data: { isActive },
      include: {
        user: { select: { name: true } }
      }
    })

    return NextResponse.json({ promise })
  } catch (error) {
    console.error('Error updating promise:', error)
    return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.promise.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promise:', error)
    return NextResponse.json({ error: 'Failed to delete promise' }, { status: 500 })
  }
}
