"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Wrench,
  Upload,
  CheckCircle2,
  Wallet,
  ListChecks,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { STATUS_ORDER, type Booking, type Mechanic } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
const COMMISSION_PER_MOTOR = 15000;

export default function MekanikPage() {
  const { data: bookings, mutate } = useSWR<Booking[]>("/api/bookings", fetcher);
  const { data: mechanic } = useSWR<Mechanic>("/api/mechanics", fetcher);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobs = bookings ?? [];
  const mechId = mechanic?.id;

  // Komisi otomatis per mekanik berdasarkan jumlah motor yang ditangani
  // (status Selesai & dikerjakan oleh mekanik ini) — F-05.
  const handled = jobs.filter(
    (j) => j.status === "Selesai" && j.mechanicId === mechId
  ).length;

  async function advance(id: number, current: string) {
    setError(null);
    const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number]);
    const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, mechanicId: mechId }),
      });
      mutate();
    } catch {
      setError("Gagal memperbarui status. Coba lagi.");
    }
  }

  async function uploadEvidence(id: number, file: File) {
    setError(null);
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) {
        const err = await up.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengunggah foto");
      }
      const { url } = await up.json();

      const res = await fetch(`/api/bookings/${id}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Bukti Komponen Rusak",
          note: "Diunggah dari tablet mekanik",
          price: 0,
          photoUrl: url,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan temuan");
      }
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah foto");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <Container>
      <PageHeader
        eyebrow="MEKANIK · Dashboard Workshop (POS)"
        title="Dashboard Workshop"
        description="Antarmuka tablet untuk mekanik: kelola antrean harian, update status, unggah bukti komponen rusak, dan pantau komisi otomatis."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl neon-border glass p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl neon-border">
            <User className="h-5 w-5 neon-text" />
          </span>
          <div>
            <div className="text-sm font-semibold">{mechanic?.name ?? "Bro Andi"}</div>
            <div className="text-xs text-muted">Kepala Mekanik · Shift {mechanic?.shift ?? "15.00–21.00"}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Stat icon={ListChecks} label="Antrean" value={jobs.length} />
          <Stat icon={CheckCircle2} label="Selesai" value={handled} />
          <Stat icon={Wallet} label="Komisi" value={`Rp ${(handled * COMMISSION_PER_MOTOR).toLocaleString()}`} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((j) => {
          const idx = STATUS_ORDER.indexOf(j.status as (typeof STATUS_ORDER)[number]);
          const evidence = j.findings.filter((f) => f.photoUrl);
          return (
            <Card key={j.id}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold neon-text">{j.queueNumber}</span>
                {j.mechanicId != null && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                    Diambil
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm font-medium">{j.ownerName} · {j.motor}</div>
              <div className="text-xs text-muted">{j.serviceType}</div>

              <div className="mt-4 flex items-center">
                {STATUS_ORDER.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <span className={`h-2 flex-1 rounded-full ${i <= idx ? "bg-neon" : "bg-line"}`} />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                {STATUS_ORDER.map((s) => (
                  <span key={s} className={s === j.status ? "neon-text font-medium" : ""}>{s}</span>
                ))}
              </div>

              {evidence.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {evidence.map((f) => (
                    <a
                      key={f.id}
                      href={f.photoUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-line bg-surface-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.photoUrl!}
                        alt={f.name}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <label
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-line py-2 text-sm font-medium text-muted hover:border-neon hover:text-neon disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploadingId === j.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingId === j.id ? "Unggah..." : "Unggah Bukti"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={uploadingId !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadEvidence(j.id, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={() => advance(j.id, j.status)}
                  disabled={idx >= STATUS_ORDER.length - 1}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold glow-btn disabled:cursor-not-allowed disabled:opacity-30 hover:glow-btn-hover"
                >
                  {idx >= STATUS_ORDER.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  {idx >= STATUS_ORDER.length - 1 ? "Selesai" : "Lanjut"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wrench;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2">
      <Icon className="h-4 w-4 neon-text" />
      <div>
        <div className="text-sm font-bold">{value}</div>
        <div className="text-[10px] text-muted">{label}</div>
      </div>
    </div>
  );
}
