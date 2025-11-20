import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import TrainerCard from "@/components/TrainerCard";

function formatTime(d: Date) {
  try {
    return new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return d.toTimeString().slice(0,5);
  }
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
              <TrainerCard
                key={t ? t.user_id : `placeholder-${idx}`}
                trainerId={t ? t.user_id : null}
                name={name}
                bio={bio}
                slots={slots}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
}
