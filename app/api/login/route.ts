import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body || {}
    if (!email) return NextResponse.json({ error: 'Manjka email' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Uporabnik ne obstaja' }, { status: 404 })

    return NextResponse.json({ message: 'Prijava uspešna (demo)', user: { id: user.id, email: user.email, username: user.username } })
  } catch (e) {
    return NextResponse.json({ error: 'Napaka pri prijavi' }, { status: 500 })
  }
}
