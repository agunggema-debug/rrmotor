"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Check,
  X,
  Camera,
  CircleDollarSign,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { STATUS_ORDER, type Booking } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

function getOwnerMessage(user: unknown): string {
  return user
    ? "Hanya pemilik booking yang dapat menyetujui temuan ini."
    : "Login sebagai pemilik booking untuk menyetujui temuan ini.";
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { data, mutate, isLoading } = useSWR<Booking[]>("/api/bookings", fetcher);
  const [activeId, setActiveId] = useState<number | null>(null);

  const bookings = data ?? [];
  const active = bookings.find((b) => b.id === activeId) ?? bookings[0];
  const step = active
    ? STATUS_ORDER.indexOf(active.status as (typeof STATUS_ORDER)[number])
    : -1;

  // Hanya pemilik booking (user yang telah booking) yang boleh menyetujui temuan.
  const isBookingOwner =
    !!user && !!active?.userId && active.userId === user.userId;

  async function decide(fid: number, status: "approved" | "rejected") {
    await fetch(`/api/bookings/${active!.id}/findings/${fid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  return (
    <Container>
      <PageHeader
        eyebrow="F-02 · Live Progress & Digital Billing"
        title="Pantau Motor, Real-time"
        description="Status pengerjaan update maksimal 3 detik dari tablet mekanik. Setujui temuan kerusakan tambahan langsung dari HP—lengkap dengan bukti foto."
      />

      {isLoading && <p className="text-muted">Memuat antrean...</p>}

      {active && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* List */}
          <div className="space-y-3">
            {bookings.map((j) => (
              <button
                key={j.id}
                onClick={() => setActiveId(j.id)}
                className={`block w-full rounded-2xl border p-4 text-left transition-colors ${
                  j.id === active.id ? "neon-border bg-neon/5" : "border-line glass hover:border-neon/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold neon-text">{j.queueNumber}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                    {j.status}
                  </span>
                </div>
                <div className="mt-1 text-sm">{j.ownerName} · {j.motor}</div>
                <div className="text-xs text-muted">{j.serviceType}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{active.ownerName} · {active.motor}</h3>
                  <p className="text-sm text-muted">{active.serviceType} · Antrean {active.queueNumber}</p>
                </div>
                <span className="rounded-full bg-neon/10 px-3 py-1 text-sm neon-text">
                  {active.status}
                </span>
              </div>

              <div className="mt-6 flex items-center">
                {STATUS_ORDER.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full border text-sm ${
                          i <= step ? "neon-border neon-text" : "border-line text-muted"
                        }`}
                      >
                        {i < step ? <Check className="h-5 w-5" /> : i + 1}
                      </span>
                      <span className={`mt-2 text-[11px] ${i <= step ? "text-light" : "text-muted"}`}>{s}</span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-neon" : "bg-line"}`} />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="flex items-center gap-2 font-semibold">
                <CircleDollarSign className="h-4 w-4 neon-text" /> Rincian Biaya (Estimasi)
              </h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">{active.serviceType}</span><span>Rp {active.basePrice.toLocaleString()}</span></div>
                {active.findings.filter(f => f.status === "approved").map(f => (
                  <div key={f.id} className="flex justify-between"><span className="text-muted">{f.name} ✓</span><span>Rp {f.price.toLocaleString()}</span></div>
                ))}
                <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-bold">
                  <span>Total</span>
                  <span className="neon-text">
                    Rp {(active.basePrice + active.findings.filter(f => f.status === "approved").reduce((s, f) => s + f.price, 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="flex items-center gap-2 font-semibold">
                <Camera className="h-4 w-4 neon-text" /> Temuan Tambahan dari Mekanik
              </h3>
              {active.findings.length === 0 && (
                <p className="mt-3 text-sm text-muted">Belum ada temuan tambahan. 🤙</p>
              )}
              <div className="mt-4 space-y-3">
                {active.findings.map((f) => (
                  <div key={f.id} className="rounded-xl border border-line bg-surface p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted">
                        <Camera className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{f.name}</span>
                          <span className="neon-text">Rp {f.price.toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{f.note}</p>
                        {f.status === "pending" ? (
                          isBookingOwner ? (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => decide(f.id, "approved")}
                                className="flex items-center gap-1 rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-[#04130b] hover:glow-btn-hover"
                              >
                                <Check className="h-4 w-4" /> Approve
                              </button>
                              <button
                                onClick={() => decide(f.id, "rejected")}
                                className="flex items-center gap-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-magenta hover:text-magenta"
                              >
                                <X className="h-4 w-4" /> Reject
                              </button>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-muted">
                              {getOwnerMessage(user)}
                            </p>
                          )
                        ) : (
                          <div className={`mt-3 text-sm font-medium ${f.status === "approved" ? "neon-text" : "text-magenta"}`}>
                            {f.status === "approved" ? "✓ Disetujui" : "✕ Ditolak"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}
