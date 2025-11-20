import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const role = await getCurrentUserRole()
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    })

    const members = users.map(u => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      status: u.is_active ? 'Aktiven' : 'Potekel',
      joined_date: u.created_at.toISOString().split('T')[0]
    }))

    return NextResponse.json(members)
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
