import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { deletedAt: null },
      include: {
        universities: {
          select: { id: true, nameAr: true, nameEn: true, city: true, type: true },
        },
        _count: {
          select: {
            applications: true,
            universities: true,
          },
        },
      },
      orderBy: { nameAr: "asc" },
    });

    return NextResponse.json({ countries });
  } catch (error) {
    console.error("Get countries error:", error);
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 });
  }
}
