"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

const HEARTBEAT_MS = 30_000;

// Menampilkan jumlah pengunjung (guest) yang sedang online.
// Mengirim heartbeat ke API setiap 30 detik dan saat tab kembali terlihat.
export default function OnlineVisitors() {
  const [online, setOnline] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;

    async function beat() {
      try {
        const res = await fetch("/api/visitors/online", {
          method: "POST",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data: { online?: number } = await res.json();
        if (active && typeof data.online === "number") {
          setOnline(data.online);
          setLive(true);
        }
      } catch {
        if (active) setLive(false);
      }
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            live ? "animate-ping bg-neon" : "bg-muted"
          } opacity-75`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            live ? "bg-neon" : "bg-muted"
          }`}
        />
      </span>
      <Users className="h-3.5 w-3.5" />
      <span>{online === null ? "—" : online} pengunjung online</span>
    </span>
  );
}
