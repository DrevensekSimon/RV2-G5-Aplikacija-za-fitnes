import Link from 'next/link'
import { prisma } from '../lib/prisma'

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd" />
    </svg>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <nav className="flex items-center gap-6 text-sm">
          <a href="#ponudba" className="font-medium hover:text-gray-900">Ponudba</a>
          <a href="#urnik" className="font-medium hover:text-gray-900">Urnik</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/prijava" className="rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Prijava</Link>
          <Link href="/registracija" className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">Registracija</Link>
        </div>
      </div>
    </header>
  )
}

function PackageCard({ pkg }: { pkg: { id: bigint; name: string; price: string; period: string; features: string[] } }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-700">{pkg.name}</h3>
        <div className="mt-2 flex items-end justify-center gap-1">
          <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
          <span className="text-2xl font-bold">€</span>
          <span className="text-gray-500">/{pkg.period}</span>
        </div>
      </div>
      <ul className="mt-6 grow space-y-2 text-sm text-gray-700">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2"><CheckIcon /><span>{f}</span></li>
        ))}
      </ul>
      <button className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Izberi paket</button>
    </div>
  )
}

function GroupClassCard({ c }: { c: { id: bigint; title: string; about: string; schedule: string } }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{c.title}</h4>
      <p className="mt-2 text-xs text-gray-600">{c.about}</p>
      <p className="mt-3 text-[11px] text-gray-500">{c.schedule}</p>
      <button className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium hover:bg-gray-50">Poglej urnik</button>
    </div>
  )
}

export default async function Page() {
  const [plansRaw, classTypes] = await Promise.all([
    prisma.membershipPlan.findMany({ where: { is_active: true }, orderBy: { price_eur: 'asc' } }),
    prisma.classType.findMany({ orderBy: { id: 'asc' }, take: 6 })
  ])

  const plans = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    price: (p.price_eur as any).toString(),
    period: p.billing_period,
    features: Array.isArray(p.perks_json) ? (p.perks_json as any) : []
  }))

  const now = new Date()
  const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const sessions = await prisma.classSession.findMany({
    where: { start_at: { gte: now, lte: in14 } },
    include: { class_type: true, location: true },
    orderBy: { start_at: 'asc' }
  })

  const sessionsByType = new Map<number, typeof sessions>()
  for (const s of sessions) {
    const key = Number(s.class_type_id)
    const arr = sessionsByType.get(key) || []
    arr.push(s)
    sessionsByType.set(key, arr)
  }

  const groupClasses = classTypes.map((ct) => {
    const list = sessionsByType.get(Number(ct.id)) || []
    const next = list.slice(0, 2).map((s) => {
      const d = s.start_at
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
    })
    return {
      id: ct.id,
      title: ct.name,
      about: ct.description,
      schedule: next.length ? `Naslednji termini: ${next.join(', ')}` : 'Ni razpoložljivih terminov'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold md:text-4xl">Dobrodošli na strani fitnes WiiFit</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Dejavni podatki iz baze: paketi in urnik.</p>
        </div>
      </section>

      <section id="ponudba" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Plan paketa</h2>
          <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((pkg) => (<PackageCard key={String(pkg.id)} pkg={pkg} />))}
          </div>
        </div>
      </section>

      <section id="urnik" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Skupinske vadbe</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {groupClasses.map((c) => (<GroupClassCard key={String(c.id)} c={c} />))}
          </div>
        </div>
      </section>
    </div>
  )
}

