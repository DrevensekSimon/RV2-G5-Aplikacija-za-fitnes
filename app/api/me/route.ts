import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const uid = cookies().get('uid')?.value
    if (!uid) return NextResponse.json({ user: null })

    const user = await prisma.user.findUnique({ where: { id: uid }, include: { role: true } })
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role?.name || null } })
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
