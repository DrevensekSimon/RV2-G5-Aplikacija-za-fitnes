import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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
    const uid = cookies().get('uid')?.value

    // Fetch class sessions
    const classSessions = await prisma.classSession.findMany({
      where: { start_at: { gte: fromDate, lt: toDate } },
      include: {
        class_type: true,
        coach: { include: { user: true } },
        location: true,
      },
      orderBy: { start_at: 'asc' },
    })

    const classData = classSessions.map((s) => ({
      id: String(s.id),
      start_at: s.start_at.toISOString(),
      title: s.class_type?.name ?? '',
      trainer: s.coach?.user ? `${s.coach.user.first_name} ${s.coach.user.last_name}` : '',
      location: s.location?.name ?? '',
    }))

    // Fetch PT sessions for logged-in user
    let ptData: any[] = []
    if (uid) {
      const ptSessions = await prisma.ptSession.findMany({
        where: { 
          user_id: uid,
          start_at: { gte: fromDate, lt: toDate }
        },
        orderBy: { start_at: 'asc' },
      })

      // Get trainer info for each PT session
      for (const s of ptSessions) {
        const trainer = await prisma.trainer.findUnique({
          where: { user_id: s.trainer_id },
          include: { user: true }
        })
        ptData.push({
          id: String(s.id),
          start_at: s.start_at.toISOString(),
          title: 'Osebni trening',
          trainer: trainer?.user ? `${trainer.user.first_name} ${trainer.user.last_name}` : '',
          location: '',
        })
      }
    }

    // Combine both
    const allSessions = [...classData, ...ptData].sort((a, b) => 
      new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    )

    return NextResponse.json({ sessions: allSessions })
  } catch (e) {
    console.error('Sessions error:', e)
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 })
  }
}
