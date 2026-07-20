import { NextResponse } from "next/server";
import { BookingRepository } from "@/lib/repositories/booking";
import { UserRepository } from "@/lib/repositories/user";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { serverError } from "@/lib/http";

const bookingRepo = new BookingRepository();
const userRepo = new UserRepository();

export const dynamic = "force-dynamic";

// GET /api/admin/overview — dashboard admin (ADMIN)
export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const [bookings, users] = await Promise.all([
      bookingRepo.findMany(),
      userRepo.findMany(),
    ]);

    const totalCustomers = users.length;

    // Transform users to camelCase format for frontend
    const customers = users.map((u) => ({
      name: u.name,
      phone: u.phone,
      points: u.points,
    })).sort((a, b) => b.points - a.points).slice(0, 6);
    
    const totalBookings = bookings.length;
    
    // Calculate revenue from completed bookings
    const revenue = bookings
      .filter((b) => b.status === "Selesai")
      .reduce((s, b) => s + (b.base_price + (b.findings?.filter(f => f.status === "approved").reduce((sf, f) => sf + f.price, 0) ?? 0)), 0);

    const byService = new Map<string, { revenue: number; count: number }>();
    for (const b of bookings) {
      const cur = byService.get(b.service_type) ?? { revenue: 0, count: 0 };
      cur.revenue += b.base_price + (b.findings?.filter(f => f.status === "approved").reduce((sf, f) => sf + f.price, 0) ?? 0);
      cur.count += 1;
      byService.set(b.service_type, cur);
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
        queueNumber: b.queue_number,
        ownerName: b.owner_name,
        motor: b.motor,
        serviceType: b.service_type,
        status: b.status,
        total: b.base_price + (b.findings?.filter(f => f.status === "approved").reduce((sf, f) => sf + f.price, 0) ?? 0),
      }));

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