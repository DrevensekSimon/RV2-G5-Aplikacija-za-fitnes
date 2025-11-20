import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const role = await getCurrentUserRole()
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const classId = BigInt(params.id)

    // Get class info
    const classSession = await prisma.classSession.findUnique({
      where: { id: classId },
      include: { class_type: true }
    })

    if (!classSession) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Get participants
    const registrations = await prisma.classRegistration.findMany({
      where: { session_id: classId },
      include: { user: true },
      orderBy: { registered_at: 'desc' }
    })

    const participants = registrations.map(reg => ({
      id: reg.user.id,
      first_name: reg.user.first_name,
      last_name: reg.user.last_name,
      email: reg.user.email,
      status: reg.user.is_active ? 'Aktiven' : 'Neaktiven',
      joined_date: new Date(reg.registered_at).toLocaleDateString('sl-SI')
    }))

    return NextResponse.json({
      className: classSession.class_type.name,
      participants
    })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
