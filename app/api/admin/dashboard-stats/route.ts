import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const role = await getCurrentUserRole()
    console.log('Dashboard role:', role)
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - not admin' }, { status: 403 })
    }

    const [totalUsers, activeSubscriptions, payments, classSessions] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.payment.findMany({ where: { status: 'succeeded' } }),
      prisma.classSession.count()
    ])

    const totalRevenue = payments.reduce((sum: number, p) => sum + Number(p.amount_eur), 0)

    const membersByClass = await prisma.classRegistration.groupBy({
      by: ['session_id'],
      _count: { session_id: true },
      orderBy: { _count: { session_id: 'desc' } },
      take: 5
    })

    const recentActivity = [
      { time: 'Pravkar', action: 'Registracija nov člana Aleks Johnson.' },
      { time: '5 minut nazaj', action: 'Rezervacija na vadbi Joga Flow.' },
      { time: '30 minut nazaj', action: 'Možnost izposoje Mark Davis je dodal novo mesto za razpoložljivost.' },
      { time: '1 uro nazaj', action: 'Opomnik razposlano Mihajela Browna je bila obdelana.' },
      { time: '3 ure nazaj', action: 'Novi upogled račun Napredek HIT je pregledan.' },
      { time: '4 ure nazaj', action: 'Posebne informacije, prispevek od Emily White glede obdelave treninga.' }
    ]

    const membersByClassFormatted = membersByClass.map(item => ({
      session_id: item.session_id.toString(),
      _count: item._count
    }))

    return NextResponse.json({
      totalUsers,
      newMembers: activeSubscriptions,
      totalRevenue: totalRevenue.toFixed(2),
      totalClasses: classSessions,
      membersByClass: membersByClassFormatted,
      recentActivity
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
