import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const trainers = await prisma.trainer.findMany({
      include: { user: true },
      orderBy: { user_id: "asc" }
    });

    return NextResponse.json({ trainers });
  } catch (e) {
    return NextResponse.json({ error: "Napaka pri nalaganju trenerjev" }, { status: 500 });
  }
}
