import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      where: { deletedAt: null },
      include: {
        country: { select: { nameAr: true, flagEmoji: true } },
        programs: true,
        _count: {
          select: {
            applications: true,
            commissions: true,
          },
        },
      },
      orderBy: { nameAr: "asc" },
    });

    return NextResponse.json({ universities });
  } catch (error) {
    console.error("Get universities error:", error);
    return NextResponse.json({ error: "Failed to load universities" }, { status: 500 });
  }
}
