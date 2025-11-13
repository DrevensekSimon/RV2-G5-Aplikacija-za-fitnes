import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    if (!from || !to) {
      return NextResponse.json({ error: 'from and to query params are required' }, { status: 400 })
    }
    const fromDate = new Date(from)
    const toDate = new Date(to)

    const sessions = await prisma.classSession.findMany({
      where: { start_at: { gte: fromDate, lt: toDate } },
      include: {
        class_type: true,
        coach: { include: { user: true } },
        location: true,
      },
      orderBy: { start_at: 'asc' },
    })

    const data = sessions.map((s) => ({
      id: String(s.id),
      start_at: s.start_at.toISOString(),
      title: s.class_type?.name ?? '',
      trainer: s.coach?.user ? `${s.coach.user.first_name} ${s.coach.user.last_name}` : '',
      location: s.location?.name ?? '',
    }))

    return NextResponse.json({ sessions: data })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 })
  }
}
