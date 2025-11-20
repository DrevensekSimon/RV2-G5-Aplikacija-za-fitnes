import { cookies } from 'next/headers'
import { prisma } from './prisma'

export type UserRole = 'user' | 'admin' | 'trainer'

export async function getCurrentUser() {
  const uid = cookies().get('uid')?.value
  if (!uid) return null
  
  return await prisma.user.findUnique({
    where: { id: uid },
    include: { role: true }
  })
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    if (!user.role) return null
    
    const roleName = user.role.name.toLowerCase()
    if (roleName === 'admin' || roleName === 'trainer') return 'admin'
    return 'user'
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin'
}

export function isUser(role: UserRole | null): boolean {
  return role === 'user'
}
