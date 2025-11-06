import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

function parseStart(startAtIsoOrTime: string): Date | null {
  if (!startAtIsoOrTime) return null;
  // ISO first
  const iso = Date.parse(startAtIsoOrTime);
  if (!Number.isNaN(iso)) return new Date(iso);
  // HH:mm fallback -> use next day at that time
  const m = /^([0-2]\d):([0-5]\d)$/.exec(startAtIsoOrTime);
  if (m) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const uid = cookies().get("uid")?.value;
    if (!uid) return NextResponse.json({ error: "Ni prijave" }, { status: 401 });
    const body = await req.json().catch(() => ({} as any));
    const trainerId = String(body?.trainerId || "");
    const startAtIso = String(body?.startAtIso || "");
    if (!trainerId) return NextResponse.json({ error: "Manjka trainerId" }, { status: 400 });
    const startAt = parseStart(startAtIso);
    if (!startAt) return NextResponse.json({ error: "Neveljaven termin" }, { status: 400 });

    const trainer = await prisma.trainer.findUnique({ where: { user_id: trainerId } });
    if (!trainer) return NextResponse.json({ error: "Trener ne obstaja" }, { status: 404 });

    // Basic check: avoid duplicate booking for same user/trainer/time
    const exists = await prisma.ptSession.findFirst({ where: { user_id: uid, trainer_id: trainerId, start_at: startAt } });
    if (exists) return NextResponse.json({ message: "Termin je že rezerviran." });

    const session = await prisma.ptSession.create({
      data: {
        trainer_id: trainerId,
        user_id: uid,
        start_at: startAt,
        duration_min: 60,
        status: "requested",
      },
    });

    return NextResponse.json({ message: "Rezervacija shranjena", id: session.id });
  } catch (e) {
    return NextResponse.json({ error: "Napaka pri rezervaciji" }, { status: 500 });
  }
}
