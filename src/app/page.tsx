import Link from "next/link";
import { Bike, CalendarClock, Activity, Sparkles, Award, Wrench, MapPin, Clock, ArrowRight } from "lucide-react";
import { Container, CTAButton, Pill } from "@/components/ui";

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Smart Booking",
    desc: "Ambil slot jam produktif sepulang sekolah/kuliah. Anti antre, dapat nomor antrean digital.",
    href: "/booking",
  },
  {
    icon: Activity,
    title: "Live Progress & Billing",
    desc: "Pantau status motor real-time. Setujui sparepart tambahan langsung dari HP tanpa didatangi.",
    href: "/progress",
  },
  {
    icon: Sparkles,
    title: "Modif Corner",
    desc: "Chat langsung dengan Modificator Specialist & lihat portofolio modifikasi ala Instagram.",
    href: "/modif",
  },
  {
    icon: Award,
    title: "RR Points",
    desc: "1 poin tiap Rp10.000. Tukar dengan diskon oli, stiker eksklusif, kaos, atau kopi gratis.",
    href: "/points",
  },
];

const JOURNEY = [
  { step: "01", title: "Eksplorasi & Booking", desc: "Pilih jenis servis & jadwal, dapat antrean digital." },
  { step: "02", title: "Servis Transparan", desc: "Mekanik scan QR, estimasi biaya muncul & disetujui digital." },
  { step: "03", title: "Monitoring Real-time", desc: "Nongkrong di coffee shop sambil pantau status pengerjaan." },
  { step: "04", title: "Bayar & Klaim Poin", desc: "Bayar e-wallet, dapat RR Points untuk redeem merch." },
];

const STATS = [
  { value: "70%", label: "Berkurangnya waktu tunggu" },
  { value: "1.000+", label: "Target user 15-25 tahun" },
  { value: "3 dtk", label: "Delay update status maksimal" },
  { value: "60%", label: "Target repeat order" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Pill>
              <span className="h-2 w-2 rounded-full bg-neon" /> Bengkel Digital Generasi Muda
            </Pill>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Servis Motor <span className="neon-text">Anti-Ribet</span>,
              <br /> Seru Kayak Nongkrong.
            </h1>
            <p className="mt-5 max-w-md text-muted sm:text-lg">RR MOTOR menggabungkan perawatan mesin, modifikasi estetik, dan ekosistem digital dalam satu platform mobile-first yang clean, transparan, dan zero-hassle.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/booking">Booking Sekarang</CTAButton>
              <CTAButton href="/modif" variant="outline">
                Lihat Modif Corner
              </CTAButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-neon" /> Jl. Wangisagara, Majalaya, Bandung Regency, West Java 40392
              </span>
              <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1">
                <Clock className="h-4 w-4 shrink-0 text-neon" /> Buka 08.00–17.00
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="glass neon-border rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Antrean Hari Ini</span>
                <span className="rounded-full bg-neon/10 px-3 py-1 text-xs neon-text">Live</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {["A-12", "A-13", "A-14"].map((q, i) => (
                  <div key={q} className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                    <div className="text-lg font-bold neon-text">{q}</div>
                    <div className="text-[11px] text-muted">{["Dikerjakan", "Menunggu", "Test Drive"][i]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Bagas · Vario 160", status: "Dikerjakan", pct: 70, c: "bg-neon" },
                  { label: "Siti · Beat", status: "Menunggu", pct: 20, c: "bg-electric" },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-line bg-surface p-3">
                    <div className="flex justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="text-muted">{row.status}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
                      <div className={`h-1.5 rounded-full ${row.c}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 grid h-24 w-24 place-items-center rounded-2xl electric-border glass sm:hidden lg:grid">
              <Bike className="h-10 w-10 text-electric" />
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-10">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Satu Aplikasi, <span className="neon-text">Semua Kebutuhan</span> Motormu
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href} className="glass group rounded-2xl p-5 transition-colors hover:neon-border">
                <span className="grid h-11 w-11 place-items-center rounded-xl neon-border">
                  <f.icon className="h-5 w-5 neon-text" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm neon-text opacity-0 transition-opacity group-hover:opacity-100">
                  Buka <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Journey */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Alur Pengguna <span className="neon-text">Zero-Hassle</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((j) => (
              <div key={j.step} className="glass rounded-2xl p-5">
                <div className="text-3xl font-bold neon-text">{j.step}</div>
                <h3 className="mt-2 font-semibold">{j.title}</h3>
                <p className="mt-2 text-sm text-muted">{j.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12">
        <Container>
          <div className="grid gap-4 rounded-3xl neon-border glass p-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold neon-text sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-10">
        <Container>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-line glass p-10 text-center">
            <Wrench className="h-10 w-10 neon-text" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Siap Servis Tanpa Antre?</h2>
            <p className="max-w-md text-muted">Ambil slot sekarang dan rasakan servis bengkel yang transparan, cepat, dan ramah anak motor.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <CTAButton href="/booking">Booking Sekarang</CTAButton>
              <CTAButton href="/points" variant="outline">
                Cek RR Points
              </CTAButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
