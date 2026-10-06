import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ isHeadquarter: "desc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        city: true,
        country: true,
        isHeadquarter: true,
      },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Fetch branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
