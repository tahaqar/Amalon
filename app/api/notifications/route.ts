import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.userId,
        isRead: false,
        deletedAt: null,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
