import '../styles/globals.css'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '../lib/prisma'

export const metadata = {
  title: 'WiiFit - Fitnes aplikacija',
  description: 'Fitnes aplikacija za upravljanje vadbe in paketov',
}

export const revalidate = 0 // Disable caching for layout

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const uid = cookies().get('uid')?.value
  const user = uid ? await prisma.user.findUnique({ where: { id: uid }, include: { role: true } }) : null
  const loggedIn = Boolean(user)
  const isAdmin = user?.role.name.toLowerCase() === 'admin' || user?.role.name.toLowerCase() === 'trainer'
  
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 text-sm">
            <nav className="flex items-center gap-5">
              <Link href="/" className="font-medium hover:text-gray-900">WiiFit</Link>
              <a href="/#ponudba" className="font-medium hover:text-gray-900">Ponudba</a>
              {loggedIn && !isAdmin && (
                <>
                  <Link href="/urnik-tedenski" className="font-medium hover:text-gray-900">Urnik</Link>
                  <Link href="/beljakovinski-kalkulator" className="font-medium hover:text-gray-900">Beljakovinski kalkulator</Link>
                  <Link href="/moj-profil" className="font-medium hover:text-gray-900">Moj profil</Link>
                </>
              )}
              {loggedIn && isAdmin && (
                <>
                  <Link href="/nadzorna-plosca" className="font-medium hover:text-gray-900">Nadzorna plošča</Link>
                  <Link href="/nadzorna-plosca/stranke" className="font-medium hover:text-gray-900">Stranke</Link>
                  <Link href="/nadzorna-plosca/skupinske-vadbe" className="font-medium hover:text-gray-900">Skupinske vadbe</Link>
                </>
              )}
            </nav>
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <>
                  <span className="text-xs text-gray-600">{user?.first_name} {user?.last_name}</span>
                  <a href="/api/logout" className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">Odjava</a>
                </>
              ) : (
                <>
                  <Link href="/prijava" className="rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Prijava</Link>
                  <Link href="/registracija" className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">Registracija</Link>
                </>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
