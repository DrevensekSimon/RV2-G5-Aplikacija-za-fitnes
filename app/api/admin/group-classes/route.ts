import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const role = await getCurrentUserRole()
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const classTypes = await prisma.classType.findMany({
      orderBy: { name: 'asc' }
    })

    const classesWithCounts = await Promise.all(
      classTypes.map(async (ct) => {
        const count = await prisma.classRegistration.count({
          where: {
            session: {
              class_type_id: ct.id
            }
          }
        })
        return {
          id: ct.id.toString(),
          name: ct.name,
          description: ct.description,
          participants: count,
          status: 'Aktivna'
        }
      })
    )

    return NextResponse.json(classesWithCounts)
  } catch (error) {
    console.error('Group classes fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
