import { prisma } from '../lib/prisma'
import { cookies } from 'next/headers'
import PackageCard from '../components/PackageCard'
import JoinSection from '../components/JoinSection'

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd" />
    </svg>
  )
}

function GroupClassCard({ c }: { c: { id: bigint; title: string; about: string; schedule: string } }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{c.title}</h4>
      <p className="mt-2 text-xs text-gray-600">{c.about}</p>
      <p className="mt-3 text-[11px] text-gray-500">{c.schedule}</p>
      <a href="/urnik-tedenski" className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium hover:bg-gray-50 text-center block">Poglej urnik</a>
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
      {/* Hero Section */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold md:text-4xl">Dobrodošli na strani fitnes WiiFit</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <a href="#ponudba" className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black">Poglej ponudbo</a>
        </div>
      </section>

      {/* Plan Paketa Section - DYNAMIC */}
      <section id="ponudba" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Plan paketa</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
          <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((pkg) => (<PackageCard key={String(pkg.id)} pkg={pkg} />))}
          </div>
        </div>
      </section>

      {/* Skupinske Vadbe Section - DYNAMIC */}
      <section id="urnik" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Skupinske vadbe</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Ut amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {groupClasses.map((c) => (<GroupClassCard key={String(c.id)} c={c} />))}
          </div>
        </div>
      </section>

      {/* Osebno Trenerstvo Section - STATIC */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Osebno trenerstvo</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Ut amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
      </section>

      {/* Tvoja Pot Section - STATIC */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold">Tvoja pot, tvoj trener</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Dobri prilagojene fitnes programe, zasnovane glede na tvoje potrebe in cilje. Če hiteš dosežeš rezultate. Od ognjuje tebe do pridelavanja moči – naši trenerji so tukaj zate.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-900">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">Feature feature feature feature feature</p>
              </div>
            </div>
          </div>
          <a href="/rezervacija-trenerja" className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black">Rezerviraj trenerja</a>
        </div>
      </section>

      {/* Pripravljen_a Section - DYNAMIC (hidden if logged in) */}
      <JoinSection />
    </div>
  )
}

