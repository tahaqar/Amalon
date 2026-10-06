import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { encryptPassport } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const level = searchParams.get("level") || "";
    const status = searchParams.get("status") || "";
    const branchId = searchParams.get("branchId") || "";

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { fullNameAr: { contains: search } },
        { fullNameEn: { contains: search } },
        { studentCode: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (country && country !== "all") {
      where.desiredCountry = country;
    }

    if (level && level !== "all") {
      where.targetLevel = level;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (branchId && branchId !== "all") {
      where.branchId = branchId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        counselor: { select: { id: true, name: true } },
        applications: {
          select: {
            id: true,
            status: true,
            country: { select: { nameAr: true, flagEmoji: true } },
            university: { select: { nameAr: true, nameEn: true } },
          },
        },
        _count: {
          select: {
            applications: true,
            documents: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const {
      fullNameAr,
      fullNameEn,
      nationality,
      phone,
      whatsapp,
      email,
      passportNumber,
      desiredMajor,
      desiredCountry,
      targetLevel,
      budget,
      branchId,
      notes,
    } = body;

    if (!fullNameAr || !phone || !email) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف والبريد مطلوبين" }, { status: 400 });
    }

    // Duplicate detection
    const existing = await prisma.student.findFirst({
      where: {
        deletedAt: null,
        OR: [{ phone }, { email }, { whatsapp: phone }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `يوجد طالب مسجل مسبقاً بنفس رقم الهاتف أو البريد (${existing.fullNameAr} - ${existing.studentCode})` },
        { status: 409 }
      );
    }

    // Auto generate code
    const count = await prisma.student.count();
    const studentCode = `AML-2026-${String(count + 1).padStart(3, "0")}`;

    // Get default branch if not provided
    const targetBranchId =
      branchId ||
      session?.branchId ||
      (await prisma.branch.findFirst({ where: { isHeadquarter: true } }))?.id;

    const student = await prisma.student.create({
      data: {
        studentCode,
        fullNameAr,
        fullNameEn: fullNameEn || fullNameAr,
        nationality: nationality || "Egyptian",
        phone,
        whatsapp: whatsapp || phone,
        email,
        residenceCountry: "Egypt",
        passportNumberEnc: encryptPassport(passportNumber || "P" + Math.floor(1000000 + Math.random() * 9000000)),
        desiredMajor: desiredMajor || "General",
        desiredCountry: desiredCountry || "Spain",
        targetLevel: targetLevel || "bachelor",
        budget: budget ? parseFloat(budget) : 5000,
        branchId: targetBranchId!,
        counselorId: session?.userId,
        status: "new",
        notes,
      },
    });

    // Create initial timeline event
    await prisma.timelineEvent.create({
      data: {
        studentId: student.id,
        category: "status_change",
        titleAr: "تسجيل ملف طالب جديد",
        titleEn: "New student registered",
        description: `تم إنشاء الملف برقم كودي ${studentCode}`,
        color: "blue",
        actorName: session?.name || "System",
      },
    });

    // Audit log
    await logAudit({
      userId: session?.userId,
      userName: session?.name,
      action: "create",
      entity: "Student",
      entityId: student.id,
      newValue: student,
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
