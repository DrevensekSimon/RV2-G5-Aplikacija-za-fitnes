import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../lib/prisma";

function formatDateTime(d: Date) {
  try {
    return new Intl.DateTimeFormat("sl-SI", { dateStyle: "long", timeStyle: "short" }).format(d);
  } catch {
    return d.toISOString();
  }
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "danger" }) {
  const map: Record<string, string> = {
    default: "bg-gray-800 text-white",
    success: "bg-emerald-600 text-white",
    danger: "bg-rose-700 text-white",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[tone]}`}>{children}</span>;
}

function Header({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-medium hover:text-gray-900">Ponudba</Link>
          <a href="/\#urnik" className="font-medium hover:text-gray-900">Urnik</a>
        </nav>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link href="/moj-profil" className="rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Moj profil</Link>
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
  );
}

export default async function MojProfilPage() {
  const uid = cookies().get("uid")?.value;
  if (!uid) redirect("/prijava");

  const user = await prisma.user.findUnique({
    where: { id: uid! },
    include: {
      role: true,
      subscriptions: {
        where: { status: "active" },
        include: { plan: true },
        orderBy: { id: "desc" },
        take: 1,
      },
      class_registrations: {
        include: {
          session: {
            include: { class_type: true, coach: { include: { user: true } }, location: true },
          },
        },
        orderBy: { session: { start_at: "asc" } },
        take: 10,
      },
    },
  });

  if (!user) redirect("/prijava");

  const sub = user.subscriptions[0] || null;
  const now = new Date();
  const upcoming = user.class_registrations.filter((r) => r.session.start_at > now);
  const past = user.class_registrations.filter((r) => r.session.start_at <= now).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header loggedIn={true} />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Zdravo, {user.first_name}!</h1>

        <div className="mt-6 grid gap-6 md:grid-cols-[2fr,1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Subscription card */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold"><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-800"><path d="M2.5 6.5A2.5 2.5 0 015 4h10a2.5 2.5 0 012.5 2.5V15a1 1 0 01-1.447.894L13 14l-3 1-3-1-3.053 1.22A1 1 0 012.5 15V6.5z"/></svg>Aktivna naročnina</div>
                {sub ? <Badge tone="success">Aktivna</Badge> : <Badge tone="danger">Ni aktivna</Badge>}
              </div>

              {sub ? (
                <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 text-sm">
                  <div>
                    <div className="font-semibold">{sub.plan.name}</div>
                    <p className="mt-2 text-gray-600">{Array.isArray(sub.plan.perks_json) && sub.plan.perks_json.length ? String(sub.plan.perks_json[0]) : ""}</p>
                    <p className="mt-3 text-[12px] text-gray-500">Obnovitev naročnine: {formatDateTime(sub.current_period_end)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold">{(sub.plan.price_eur as any).toString()}€<span className="text-sm font-semibold text-gray-600">/{sub.plan.billing_period === 'monthly' ? 'mesec' : 'leto'}</span></div>
                    <Link href="/moj-profil/narocnina" className="mt-3 inline-block rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black">Upravljaj z naročnino</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-600">Nimate aktivne naročnine.</div>
              )}

              <div className="mt-5 border-t pt-4">
                <Link href="/moj-profil/narocnina" className="inline-block rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black">Upravljanje naročnine</Link>
              </div>
            </section>

            {/* Trainings card */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-800"><path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v3H2V6a2 2 0 012-2h1V3a1 1 0 112 0v1zm15 8v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9h20z"/></svg>Rezervirani treningi</div>
              <p className="mt-1 text-xs text-gray-500">Tvoji treningi</p>

              <div className="mt-4 space-y-3">
                {upcoming.length === 0 && past.length === 0 && (
                  <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">Ni rezervacij.</div>
                )}

                {[...upcoming, ...past].slice(0, 6).map((r) => {
                  const s = r.session;
                  const title = `${s.class_type.name} z ${s.coach.user.first_name} ${s.coach.user.last_name}`;
                  const isUpcoming = s.start_at > now;
                  return (
                    <div key={`${String(s.id)}-${r.user_id}`} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">{title}</div>
                        <div className="mt-1 text-xs text-gray-600">{formatDateTime(s.start_at)} · {s.location.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUpcoming ? (
                          <>
                            <button className="rounded-full bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white">Odjava</button>
                            <Badge>Prihajajoče</Badge>
                          </>
                        ) : (
                          <Badge>Končano</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
              <div className="mt-4 text-lg font-extrabold">{user.first_name} {user.last_name}</div>
              <div className="text-[11px] text-gray-500">{user.id}</div>
              <div className="mt-3">
                <button className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <span className="i">⚙️</span> Uredi profil
                </button>
              </div>
              <div className="mt-6 space-y-1 text-sm text-gray-600">
                <div className="text-gray-400">email</div>
                <div className="font-medium">{user.email}</div>
                <div className="text-gray-400">telefon</div>
                <div className="font-medium">{user.phone || "—"}</div>
                <div className="pt-3 text-xs">
                  <a href="/api/logout" className="text-rose-700 hover:underline">Odjava</a>
                </div>
              </div>
            </section>

            <section className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm">
              <div>
                <div className="text-sm font-semibold">Notifikacije</div>
                <div className="text-xs text-gray-500">(demo stikalo)</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-5 w-5 translate-x-1 transform rounded-full bg-white shadow" />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
