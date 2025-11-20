import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const uid = cookies().get("uid")?.value;
    if (!uid) return NextResponse.json({ error: "Ni prijave" }, { status: 401 });

    const sessionId = String(params.id);
    
    // Verify session belongs to user
    const session = await prisma.ptSession.findUnique({
      where: { id: BigInt(sessionId) }
    });

    if (!session) return NextResponse.json({ error: "Sesija ne obstaja" }, { status: 404 });
    if (session.user_id !== uid) return NextResponse.json({ error: "Ni dovoljenj" }, { status: 403 });

    // Delete session
    await prisma.ptSession.delete({
      where: { id: BigInt(sessionId) }
    });

    return NextResponse.json({ message: "Sesija izbrisana" });
  } catch (e) {
    console.error("Delete session error:", e);
    return NextResponse.json({ error: "Napaka pri brisanju" }, { status: 500 });
  }
}
