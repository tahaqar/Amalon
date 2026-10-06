import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visaCases = await prisma.visaCase.findMany({
      where: { deletedAt: null },
      include: {
        student: { select: { id: true, studentCode: true, fullNameAr: true, phone: true } },
        country: { select: { nameAr: true, flagEmoji: true } },
        checklistItems: true,
        responsibleOfficer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ visaCases });
  } catch (error) {
    console.error("Get visa error:", error);
    return NextResponse.json({ error: "Failed to load visa cases" }, { status: 500 });
  }
}
