import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

function bookingTotal(b: {
  basePrice: number;
  findings: { status: string; price: number }[];
}) {
  return (
    b.basePrice +
    b.findings
      .filter((f) => f.status === "approved")
      .reduce((s, f) => s + f.price, 0)
  );
}

// GET /api/admin/overview — dashboard admin (ADMIN)
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const [bookings, users] = await Promise.all([
      prisma.booking.findMany({ include: { findings: true } }),
      prisma.user.findMany({
        select: { id: true, name: true, phone: true, points: true },
      }),
    ]);

    const totalBookings = bookings.length;
    const totalCustomers = users.length;

    const revenue = bookings
      .filter((b) => b.status === "Selesai")
      .reduce((s, b) => s + bookingTotal(b), 0);

    const byService = new Map<string, { revenue: number; count: number }>();
    for (const b of bookings) {
      const cur = byService.get(b.serviceType) ?? { revenue: 0, count: 0 };
      cur.revenue += bookingTotal(b);
      cur.count += 1;
      byService.set(b.serviceType, cur);
    }
    const revenueByService = [...byService.entries()].map(
      ([service, v]) => ({ service, ...v })
    );

    const statusMap = new Map<string, number>();
    for (const b of bookings) {
      statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
    }
    const statusDist = ["Menunggu", "Dikerjakan", "Test Drive", "Selesai"].map(
      (s) => ({ status: s, count: statusMap.get(s) ?? 0 })
    );

    const topServices = [...revenueByService]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ service, count }) => ({ service, count }));

    const recentBookings = [...bookings]
      .reverse()
      .slice(0, 6)
      .map((b) => ({
        queueNumber: b.queueNumber,
        ownerName: b.ownerName,
        motor: b.motor,
        serviceType: b.serviceType,
        status: b.status,
        total: bookingTotal(b),
      }));

    const customers = users
      .map((u) => ({ name: u.name, phone: u.phone, points: u.points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 6);

    const done = bookings.filter((b) => b.status === "Selesai").length;
    const completionRate = totalBookings
      ? Math.round((done / totalBookings) * 100)
      : 0;

    return NextResponse.json({
      kpis: {
        bookings: totalBookings,
        customers: totalCustomers,
        services: byService.size,
        revenue,
        completionRate,
      },
      revenueByService,
      statusDist,
      topServices,
      recentBookings,
      customers,
    });
  } catch (e) {
    return serverError(e);
  }
}
