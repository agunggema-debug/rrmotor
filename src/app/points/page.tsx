"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Award,
  Coffee,
  Sticker,
  Shirt,
  Droplet,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import type { Reward, UserPoints } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const ICONS: Record<string, LucideIcon> = {
  Droplet,
  Sticker,
  Shirt,
  Coffee,
  Gift,
};

export default function PointsPage() {
  const { user: authUser } = useAuth();
  const DEMO_USER_ID = authUser?.userId ?? 1;

  const { data: user } = useSWR<UserPoints>(`/api/users/${DEMO_USER_ID}`, fetcher);
  const { data: rewards } = useSWR<Reward[]>("/api/rewards", fetcher);
  const [toast, setToast] = useState<string | null>(null);

  const points = user?.points ?? 0;
  const nextTier = 200;
  const pct = Math.min(100, Math.round((points / nextTier) * 100));

  async function redeem(r: Reward) {
    const res = await fetch(`/api/users/${DEMO_USER_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId: r.id }),
    });
    if (res.ok) {
      setToast(`Berhasil redeem: ${r.name}! 🎉`);
    } else {
      setToast("Poin tidak cukup 😢");
    }
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <Container>
      <PageHeader
        eyebrow="F-04 · RR Points & Loyalty"
        title="Kumpulkan RR Points"
        description="Setiap transaksi Rp10.000 = 1 RR Point. Tukar dengan diskon servis, stiker, kaos, atau kopi gratis di area tunggu."
      />

      <Card className="flex flex-wrap items-center justify-between gap-6 neon-border">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl neon-border">
            <Award className="h-8 w-8 neon-text" />
          </span>
          <div>
            <div className="text-sm text-muted">Saldo Poin Kamu</div>
            <div className="text-4xl font-bold neon-text">{points}</div>
            <div className="text-xs text-muted">RR Points</div>
          </div>
        </div>
        <div className="min-w-[220px] flex-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Tier Saat Ini: Rider</span>
            <span>Next: Pro ({nextTier} pts)</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-neon" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">Tinggal {Math.max(0, nextTier - points)} poin lagi ke tier Pro.</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Transaksi", d: "Bayar servis/modif via e-wallet." },
          { t: "Dapat Poin", d: "1 poin tiap Rp10.000 dibelanjakan." },
          { t: "Redeem", d: "Tukar poin di halaman ini kapan saja." },
        ].map((h, i) => (
          <Card key={i}>
            <div className="text-lg font-bold neon-text">0{i + 1}</div>
            <h4 className="mt-1 font-semibold">{h.t}</h4>
            <p className="mt-1 text-sm text-muted">{h.d}</p>
          </Card>
        ))}
      </div>

      <h3 className="mb-4 mt-10 flex items-center gap-2 font-semibold">
        <Gift className="h-4 w-4 neon-text" /> Katalog Redeem
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(rewards ?? []).map((r) => {
          const Icon = ICONS[r.icon] ?? Gift;
          const enough = points >= r.cost;
          return (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl neon-border">
                  <Icon className="h-6 w-6 neon-text" />
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{r.tag}</span>
              </div>
              <h4 className="mt-4 font-semibold">{r.name}</h4>
              <div className="mt-1 text-sm neon-text">{r.cost} poin</div>
              <button
                onClick={() => redeem(r)}
                disabled={!enough}
                className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold glow-btn disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none hover:glow-btn-hover"
              >
                {enough ? "Redeem" : "Poin Kurang"}
              </button>
            </Card>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl neon-border glass px-5 py-3 text-sm font-medium">
          {toast}
        </div>
      )}
    </Container>
  );
}
