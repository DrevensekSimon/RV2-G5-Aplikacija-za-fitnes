import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

export async function POST() {
  try {
    const uid = cookies().get("uid")?.value;
    if (!uid) return NextResponse.json({ error: "Ni prijave" }, { status: 401 });

    const sub = await prisma.subscription.findFirst({ where: { user_id: uid, status: "active" }, orderBy: { id: "desc" } });
    if (!sub) return NextResponse.json({ error: "Ni aktivne naročnine" }, { status: 404 });

    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "canceled", auto_renew: false, next_plan_id: null } });
    return NextResponse.json({ message: "Naročnina preklicana" });
  } catch (e) {
    return NextResponse.json({ error: "Napaka pri preklicu" }, { status: 500 });
  }
}
