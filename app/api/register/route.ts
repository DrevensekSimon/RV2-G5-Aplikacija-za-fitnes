import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, username, password, first_name, last_name, phone } = body || {}
    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json({ error: 'Manjkajoča polja' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Geslo mora imeti najmanj 6 znakov' }, { status: 400 })
    }

    let memberRole = await prisma.role.findFirst({ where: { name: 'member' } })
    if (!memberRole) {
      memberRole = await prisma.role.create({ data: { name: 'member' } })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        first_name,
        last_name,
        phone: phone || '',
        role_id: memberRole.id,
        is_active: true,
      }
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } }, { status: 201 })
  } catch (e: any) {
    const msg = e?.meta?.target?.includes('email') ? 'Email že obstaja' : e?.meta?.target?.includes('username') ? 'Uporabniško ime že obstaja' : 'Napaka pri registraciji'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
