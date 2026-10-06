import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.studentDocument.findMany({
      where: { deletedAt: null },
      include: {
        student: { select: { id: true, studentCode: true, fullNameAr: true } },
        documentType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const docTypes = await prisma.documentType.findMany({
      where: { deletedAt: null },
      orderBy: { category: "asc" },
    });

    return NextResponse.json({ documents, docTypes });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
