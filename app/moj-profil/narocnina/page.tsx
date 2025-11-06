import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import ManageSubscriptionClient from "../../../components/ManageSubscriptionClient";

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold">{children}</h2>;
}

function formatDate(d: Date) {
  try {
    return new Intl.DateTimeFormat("sl-SI", { dateStyle: "long" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export default async function NarocninaPage() {
  const uid = cookies().get("uid")?.value;
  if (!uid) redirect("/prijava");

  const user = await prisma.user.findUnique({
    where: { id: uid! },
    include: {
      subscriptions: {
        include: { plan: true, nextPlan: true, payments: true },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  });
  if (!user) redirect("/prijava");

  const sub = user.subscriptions[0] || null;
  const plans = await prisma.membershipPlan.findMany({ where: { is_active: true }, orderBy: { price_eur: "asc" } });

  const planList = plans.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: (p.price_eur as any).toString(),
    period: p.billing_period,
    perks: Array.isArray(p.perks_json) ? (p.perks_json as any as string[]) : [],
  }));

  const current = sub ? {
    id: String(sub.plan_id),
    name: sub.plan.name,
    price: (sub.plan.price_eur as any).toString(),
    period: sub.plan.billing_period,
    perks: Array.isArray(sub.plan.perks_json) ? (sub.plan.perks_json as any as string[]) : [],
    renew: sub.current_period_end,
    status: sub.status,
    nextPlanName: sub.nextPlan?.name || null,
  } : null;

  const payments = sub ? sub.payments.sort((a,b)=> (b.paid_at as any) - (a.paid_at as any)).map((p) => ({
    id: String(p.id),
    date: p.paid_at,
    amount: (p.amount_eur as any).toString(),
    status: p.status,
  })) : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/moj-profil" className="font-medium hover:text-gray-900">Moj profil</Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">Upravljanje naročnine</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/api/logout" className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">Odjava</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <Title>Trenutni fitnes paket</Title>
          {current ? (
            <div className="mt-4">
              <div className="text-2xl font-extrabold">{current.name}</div>
              <div className="mt-2 text-gray-700">
                <span className="text-xl font-bold">{current.price}€</span>
                <span className="text-sm"> / {current.period === 'monthly' ? 'mesec' : 'leto'}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Obnovitev naročnine: {formatDate(current.renew)}</p>
              {current.nextPlanName && (
                <p className="mt-1 text-sm text-amber-700">Po obnovitvi bo uporabljen paket: {current.nextPlanName}</p>
              )}
              <ul className="mt-5 space-y-2 text-sm">
                {current.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd"/></svg>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-600">Nimate aktivne naročnine. Izberite paket spodaj.</p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <Title>Upravljanje</Title>
          <div className="mt-4">
            <ManageSubscriptionClient
              plans={planList}
              currentPlanId={current?.id || null}
              hasActive={Boolean(current)}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <Title>Zgodovina plačil</Title>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-2">Datum</th>
                  <th className="py-2">Opis</th>
                  <th className="py-2">Znesek</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-gray-500">Ni plačil.</td></tr>
                )}
                {payments.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? "bg-gray-50" : ""}>
                    <td className="py-2">{formatDate(p.date)}</td>
                    <td className="py-2">Mesečna naročnina</td>
                    <td className="py-2">{p.amount}€</td>
                    <td className="py-2">
                      {p.status === 'succeeded' ? (
                        <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">Plačano</span>
                      ) : p.status === 'failed' ? (
                        <span className="rounded-full bg-rose-700/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">Napaka</span>
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">Vrnjeno</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
