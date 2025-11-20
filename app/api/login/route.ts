import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'Manjka email ali geslo' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } }) as any
    if (!user) return NextResponse.json({ error: 'Uporabnik ne obstaja' }, { status: 404 })

    if (!user.password) return NextResponse.json({ error: 'Uporabnik nima gesla' }, { status: 400 })

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return NextResponse.json({ error: 'Napačno geslo' }, { status: 401 })

    const res = NextResponse.json({ message: 'Prijava uspešna', user: { id: user.id, email: user.email, username: user.username } })
    res.cookies.set('uid', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dni
    })
    return res
  } catch (e: any) {
    console.error('Login error:', e)
    return NextResponse.json({ error: e.message || 'Napaka pri prijavi' }, { status: 500 })
  }
}
