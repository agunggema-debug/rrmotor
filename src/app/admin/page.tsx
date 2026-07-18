"use client";

import useSWR from "swr";
import {
  Wallet,
  ListChecks,
  Bike,
  Award,
  Receipt,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { StatCard, BarChart, DonutChart } from "@/components/admin-charts";
import type { Booking } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

const STATUS_COLORS: Record<string, string> = {
  Menunggu: "#8290a1",
  Dikerjakan: "#2dff88",
  "Test Drive": "#00e5ff",
  Selesai: "#ff3d81",
};

export default function AdminPage() {
  const { data, isLoading } = useSWR<{
    kpis: {
      bookings: number;
      customers: number;
      services: number;
      revenue: number;
      completionRate: number;
    };
    revenueByService: { service: string; revenue: number; count: number }[];
    statusDist: { status: string; count: number }[];
    topServices: { service: string; count: number }[];
    recentBookings: (Booking & { total: number })[];
    customers: { name: string; phone: string; points: number }[];
  }>("/api/admin/overview", fetcher);

  return (
    <Container>
      <PageHeader
        eyebrow="ADMIN · Dashboard Commerce"
        title="Dashboard RR MOTOR"
        description="Ringkasan operasional bengkel: antrean, pelanggan, layanan, dan pendapatan real-time."
      />

      {isLoading && <p className="text-muted">Memuat dashboard...</p>}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<ListChecks className="h-5 w-5" />}
              label="Total Antrean"
              value={data.kpis.bookings}
              delta={`▲ ${data.kpis.completionRate}% selesai`}
            />
            <StatCard
              tone="electric"
              icon={<Award className="h-5 w-5" />}
              label="Pelanggan"
              value={data.kpis.customers}
              delta="▲ terdaftar"
            />
            <StatCard
              tone="magenta"
              icon={<Bike className="h-5 w-5" />}
              label="Jenis Layanan"
              value={data.kpis.services}
              delta="▲ aktif"
            />
            <StatCard
              icon={<Wallet className="h-5 w-5" />}
              label="Pendapatan"
              value={`Rp ${data.kpis.revenue.toLocaleString()}`}
              delta="▲ kotor"
            />
          </div>

          {/* Charts + status */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <Receipt className="h-4 w-4 neon-text" /> Pendapatan per Layanan
              </h3>
              <div className="mt-5">
                <BarChart
                  data={data.revenueByService.map((r) => ({
                    label: r.service,
                    value: r.revenue,
                    hint: `${r.count}x`,
                  }))}
                  format={(v) => `Rp ${v.toLocaleString()}`}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold">Distribusi Status</h3>
              <div className="mt-5">
                <DonutChart
                  data={data.statusDist.map((s) => ({
                    label: s.status,
                    value: s.count,
                    color: STATUS_COLORS[s.status] ?? "#8290a1",
                  }))}
                />
              </div>
            </Card>
          </div>

          {/* Recent bookings + top services */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h3 className="font-semibold">Antrean Terbaru</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted">
                    <tr className="border-b border-line">
                      <th className="py-2 font-medium">Antrean</th>
                      <th className="py-2 font-medium">Pelanggan</th>
                      <th className="py-2 font-medium">Layanan</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.map((b) => (
                      <tr key={b.queueNumber} className="border-b border-line/60">
                        <td className="py-2.5 font-medium neon-text">{b.queueNumber}</td>
                        <td className="py-2.5">{b.ownerName}</td>
                        <td className="py-2.5 text-muted">{b.serviceType}</td>
                        <td className="py-2.5">
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-medium">
                          Rp {b.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold">Layanan Terpopuler</h3>
              <ul className="mt-4 space-y-3">
                {data.topServices.map((s, i) => (
                  <li key={s.service} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-xs font-bold neon-text">
                      {i + 1}
                    </span>
                    <span className="text-sm">{s.service}</span>
                    <span className="ml-auto text-sm text-muted">{s.count}x</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Customers */}
          <Card className="mt-6">
            <h3 className="font-semibold">Pelanggan & RR Points</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.customers.map((c) => (
                <div key={c.phone} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full neon-border">
                    <Award className="h-5 w-5 neon-text" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-muted">{c.phone}</div>
                  </div>
                  <span className="ml-auto rounded-full bg-neon/10 px-2 py-0.5 text-xs neon-text">
                    {c.points} pts
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </Container>
  );
}
