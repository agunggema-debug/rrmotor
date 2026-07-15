"use client";

import { type SubmitEvent, useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { CalendarClock, MapPin, Check, Bike, Gauge, Sparkles, Wrench, Zap } from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

const SERVICES = [
  { id: "ringan", label: "Servis Ringan", icon: Wrench, est: "~45 menit", price: 75000 },
  { id: "besar", label: "Servis Besar", icon: Bike, est: "~2 jam", price: 250000 },
  { id: "performa", label: "Upgrade Performa", icon: Gauge, est: "~3 jam", price: 500000 },
  { id: "estetik", label: "Modifikasi Estetik", icon: Sparkles, est: "By request", price: 0 },
];

const TIMES = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function nextDays(n: number) {
  const out: { iso: string; day: string; date: number; month: string }[] = [];
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 1; i <= n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
    });
  }
  return out;
}

export default function BookingPage() {
  const { user } = useAuth();
  const days = useMemo(() => nextDays(6), []);
  const [service, setService] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [motor, setMotor] = useState("");
  const [plate, setPlate] = useState("");
  const [done, setDone] = useState(false);
  const [queue, setQueue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: profile } = useSWR(user?.userId ? `/api/users/${user.userId}` : null, (url) => fetch(url).then((r) => r.json()));

  const effectiveName = name || profile?.name || "";
  const effectivePhone = phone || profile?.phone || "";

  const valid = service && day && time && effectiveName && effectivePhone && motor && plate;
  const chosen = SERVICES.find((s) => s.id === service);

  const isLoggedIn = !!user;
  const isCustomer = user?.role === "CUSTOMER";

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (user && !isCustomer) {
      setError("Hanya pelanggan (CUSTOMER) yang dapat mengambil antrean.");
      return;
    }
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: effectiveName,
          motor,
          plate: plate.toUpperCase(),
          serviceType: chosen?.label,
          appointmentDate: day,
          appointmentTime: time,
          basePrice: chosen?.price ?? 0,
          userId: user?.userId ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat booking");
      const data = await res.json();
      setQueue(data.queueNumber);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <PageHeader eyebrow="F-01 · Smart Booking" title="Booking Anti-Antre" description="Pilih layanan, tentukan jadwal jam produktif, dan dapatkan nomor antrean digital. Langsung menuju bengkel tanpa ngantre." />

      {isLoggedIn && !done && (
        <Card className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="font-semibold">Selamat datang, {profile?.name ?? user.username}!</h3>
            <p className="text-sm text-muted">Lengkapi form di bawah untuk langsung mengambil antrean.</p>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-[#04130b] hover:glow-btn-hover"
          >
            <Zap className="h-4 w-4" /> Antrean Sekarang
          </button>
        </Card>
      )}

      {done ? (
        <Card className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full neon-border">
            <Check className="h-8 w-8 neon-text" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Booking Berhasil!</h2>
          <p className="mt-2 text-muted">
            Nomor antrean digital kamu: <span className="neon-text text-3xl font-bold">{queue}</span>
          </p>
          <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Layanan</span>
              <span>{chosen?.label}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted">Jenis Motor</span>
              <span>{motor}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted">Jadwal</span>
              <span>
                {day} · {time}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted">Plat</span>
              <span>{plate.toUpperCase()}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/progress" className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold hover:glow-btn-hover">
              Pantau Progress
            </Link>
            <button onClick={() => setDone(false)} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-light hover:border-neon hover:text-neon">
              Booking Lagi
            </button>
          </div>
        </Card>
      ) : (
        <form id="booking-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <h3 className="flex items-center gap-2 font-semibold">
                <Wrench className="h-4 w-4 neon-text" /> Pilih Kategori Servis
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setService(s.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${service === s.id ? "neon-border bg-neon/5" : "border-line hover:border-neon/40"}`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${service === s.id ? "neon-border" : "border border-line"}`}>
                      <s.icon className={`h-5 w-5 ${service === s.id ? "neon-text" : "text-muted"}`} />
                    </span>
                    <span>
                      <span className="block font-medium">{s.label}</span>
                      <span className="block text-xs text-muted">
                        {s.est} · Mulai Rp {s.price.toLocaleString()}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 neon-text" /> Pilih Tanggal
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {days.map((d) => {
                  const label = `${d.day}, ${d.date} ${d.month}`;
                  return (
                    <button type="button" key={d.iso} onClick={() => setDay(label)} className={`rounded-xl border p-3 text-center transition-colors ${day === label ? "neon-border bg-neon/5" : "border-line hover:border-neon/40"}`}>
                      <div className="text-xs text-muted">{d.day}</div>
                      <div className="text-lg font-bold">{d.date}</div>
                      <div className="text-[10px] text-muted">{d.month}</div>
                    </button>
                  );
                })}
              </div>

              <h3 className="mt-6 flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 neon-text" /> Pilih Jam
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTime(t)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${time === t ? "neon-border bg-neon/5 neon-text font-medium" : "border-line text-muted hover:border-neon/40"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold">Data Motor & Kontak</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nama" value={effectiveName} onChange={setName} placeholder="Nama Anda" />
                <Field label="No. WhatsApp" value={effectivePhone} onChange={setPhone} placeholder="0812-3456-7890" />
                <Field label="Jenis Motor" value={motor} onChange={setMotor} placeholder="Vario 160" />
                <Field label="Plat Nomor" value={plate} onChange={setPlate} placeholder="B 1234 RR" className="sm:col-span-2" />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="lg:top-20">
              <h3 className="font-semibold">Ringkasan</h3>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Layanan" value={chosen?.label ?? "—"} />
                <Row label="Motor" value={motor || "—"} />
                <Row label="Tanggal" value={day || "—"} />
                <Row label="Jam" value={time || "—"} />
                <Row label="Nama" value={effectiveName || "—"} />
                <Row label="WhatsApp" value={effectivePhone || "—"} />
                <Row label="Plat" value={plate ? plate.toUpperCase() : "—"} />
              </div>
              <button
                type="submit"
                disabled={!valid || loading || (user != null && !isCustomer)}
                className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold glow-btn disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none hover:glow-btn-hover"
              >
                {loading ? "Memproses..." : "Ambil Antrean"}
              </button>
              {user != null && !isCustomer && <p className="mt-3 text-center text-xs text-magenta">Hanya pelanggan (CUSTOMER) yang dapat mengambil antrean.</p>}
              {!valid && (user == null || isCustomer) && <p className="mt-3 text-center text-xs text-muted">Lengkapi pilihan layanan, jadwal, & data di atas.</p>}
              {error && <p className="mt-3 text-center text-xs text-magenta">{error}</p>}
            </Card>

            <Card>
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 neon-text" /> Lokasi RR Motor
              </h3>
              <a
                href="https://www.google.com/maps/place/RR+MOTOR/@-7.0747411,107.7413718,18.5z/data=!4m6!3m5!1s0x2e68c1ef8c9bb8c7:0x55a4ead03e2ca1c2!8m2!3d-7.0735449!4d107.7417526!16s%2Fg%2F11f77pw9dc?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-surface"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.12),transparent_70%)]" />
                <span className="flex flex-col items-center gap-2 text-muted transition-colors group-hover:text-neon">
                  <MapPin className="h-8 w-8" />
                  <span className="text-sm font-medium">Buka di Google Maps</span>
                </span>
              </a>
              <p className="mt-2 text-xs text-muted">Jl. Wangisagara, Majalaya, Bandung Regency, West Java 40392 · Klik untuk navigasi.</p>
            </Card>
          </div>
        </form>
      )}
    </Container>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: Readonly<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-neon" />
    </label>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
