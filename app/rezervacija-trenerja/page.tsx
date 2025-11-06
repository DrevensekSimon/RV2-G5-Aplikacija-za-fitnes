import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import BookTrainerClient from "../../components/BookTrainerClient";

function formatTime(d: Date) {
  try {
    return new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return d.toTimeString().slice(0,5);
  }
}

function Header({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="font-medium hover:text-gray-900">Ponudba</Link>
          <a href="/#urnik" className="font-medium hover:text-gray-900">Urnik</a>
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

export default async function RezervacijaTrenerjaPage() {
  const loggedIn = Boolean(cookies().get('uid')?.value);
  const trainers = await prisma.trainer.findMany({ include: { user: true }, orderBy: { user_id: "asc" } });
  const trainerIds = trainers.map((t) => t.user_id);
  const now = new Date();
  const sessions = trainerIds.length
    ? await prisma.classSession.findMany({
        where: { coach_id: { in: trainerIds }, start_at: { gte: now } },
        orderBy: { start_at: "asc" },
        take: 50,
      })
    : [];
  const byCoach = new Map<string, Date[]>();
  for (const s of sessions) {
    const arr = byCoach.get(s.coach_id) || [];
    arr.push(s.start_at);
    byCoach.set(s.coach_id, arr);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header loggedIn={loggedIn} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Rezervacija trenerja</h1>

        <div className="mt-8 space-y-6">
          {(trainers.length ? trainers : [null, null, null]).map((t, idx) => {
            const name = t ? `${t.user.first_name} ${t.user.last_name}` : "Ime Priimek";
            const bio = t?.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
            const dates = t ? (byCoach.get(t.user_id) || []).slice(0, 5) : [];
            const slots = dates.length
              ? dates.map((d) => ({ iso: d.toISOString(), label: formatTime(d) }))
              : (["09:00", "10:00", "11:00", "14:00", "15:00"].map((lbl) => ({ iso: '', label: lbl })) as { iso: string; label: string }[]);
            return (
              <section key={t ? t.user_id : `placeholder-${idx}`} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a5 5 0 100 10 5 5 0 000-10zM2 22a10 10 0 1120 0H2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{name}</div>
                    <p className="mt-2 text-sm text-gray-600">{bio}</p>
                    <div className="mt-4">
                      <div className="text-sm font-semibold">Proste ure</div>
                      <BookTrainerClient trainerId={t ? t.user_id : null} slots={slots} />
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  );
}
