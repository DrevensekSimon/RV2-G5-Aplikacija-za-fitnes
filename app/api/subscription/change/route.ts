import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

function addPeriod(start: Date, period: "monthly" | "yearly") {
  const d = new Date(start.getTime());
  if (period === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export async function POST(req: Request) {
  try {
    const uid = cookies().get("uid")?.value;
    if (!uid) return NextResponse.json({ error: "Ni prijave" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const planIdStr = body?.planId as string | undefined;
    if (!planIdStr) return NextResponse.json({ error: "Manjka planId" }, { status: 400 });

    const planId = BigInt(planIdStr);
    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.is_active) return NextResponse.json({ error: "Plan ne obstaja" }, { status: 404 });

    const active = await prisma.subscription.findFirst({ where: { user_id: uid, status: "active" }, orderBy: { id: "desc" } });

    if (active) {
      if (active.plan_id === plan.id) {
        return NextResponse.json({ message: "Že na tem planu" });
      }
      await prisma.subscription.update({ where: { id: active.id }, data: { next_plan_id: plan.id } });
      return NextResponse.json({ message: "Plan bo zamenjan ob obnovitvi" });
    }

    const now = new Date();
    const end = addPeriod(now, plan.billing_period as any);
    const sub = await prisma.subscription.create({
      data: {
        user_id: uid,
        plan_id: plan.id,
        status: "active",
        current_period_start: now,
        current_period_end: end,
        auto_renew: true,
      },
    });

    await prisma.payment.create({
      data: {
        subscription_id: sub.id,
        amount_eur: plan.price_eur as any,
        paid_at: now,
        method: "card",
        status: "succeeded",
      },
    });

    return NextResponse.json({ message: "Aktivirana naročnina" });
  } catch (e) {
    return NextResponse.json({ error: "Napaka pri spremembi" }, { status: 500 });
  }
}
