import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { decryptPassport, encryptPassport } from "@/lib/crypto";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: true,
        counselor: { select: { id: true, name: true, email: true, phone: true } },
        leadSource: true,
        applications: {
          include: {
            country: true,
            university: true,
            program: true,
            stage: true,
          },
          orderBy: { createdAt: "desc" },
        },
        documents: {
          include: { documentType: true },
          orderBy: { createdAt: "desc" },
        },
        visaCases: {
          include: {
            country: true,
            checklistItems: true,
            responsibleOfficer: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          include: { receiver: { select: { id: true, name: true } } },
          orderBy: { paymentDate: "desc" },
        },
        contracts: {
          include: { invoices: true },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { dueDate: "asc" },
        },
        communications: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { sentAt: "desc" },
        },
        travelRecords: {
          orderBy: { departureDate: "desc" },
        },
        timelineEvents: {
          orderBy: { eventDate: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Decrypt passport number for authorized viewing
    const decryptedStudent = {
      ...student,
      passportNumber: decryptPassport(student.passportNumberEnc),
    };

    return NextResponse.json({ student: decryptedStudent });
  } catch (error) {
    console.error("Get student error:", error);
    return NextResponse.json({ error: "Failed to get student details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();
    const body = await req.json();

    const oldStudent = await prisma.student.findUnique({ where: { id } });
    if (!oldStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updateData: any = { ...body };
    if (body.passportNumber) {
      updateData.passportNumberEnc = encryptPassport(body.passportNumber);
      delete updateData.passportNumber;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    // If status changed, create timeline event
    if (body.status && body.status !== oldStudent.status) {
      await prisma.timelineEvent.create({
        data: {
          studentId: id,
          category: "status_change",
          titleAr: `تغيير حالة الطالب إلى: ${body.status}`,
          titleEn: `Status changed to: ${body.status}`,
          description: `تم التحديث بواسطة ${session?.name || "المستشار"}`,
          color: "green",
          actorName: session?.name || "System",
        },
      });
    }

    // Audit log
    await logAudit({
      userId: session?.userId,
      userName: session?.name,
      action: "update",
      entity: "Student",
      entityId: id,
      oldValue: oldStudent,
      newValue: updated,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    // Soft delete
    const student = await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logAudit({
      userId: session?.userId,
      userName: session?.name,
      action: "delete",
      entity: "Student",
      entityId: id,
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
