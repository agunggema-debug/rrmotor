"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Syringe,
  Key,
  Triangle,
  Settings,
  Gauge,
  Truck,
  Drill,
  Wrench,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";

const SERVICES = [
  {
    id: "injeksi",
    icon: Syringe,
    title: "Servis Injeksi",
    desc: "Perawatan & pembersihan sistem injeksi motor menggunakan ultrasonic cleaner. Menghilangkan kerak di injector, throttle body, dan intake valve untuk performa mesin yang lebih responsif dan irit bahan bakar.",
    highlight: "Cocok untuk motor matic & bebek injeksi.",
    price: "Mulai Rp85.000",
    duration: "~1 jam",
  },
  {
    id: "remote-keyles",
    icon: Key,
    title: "Duplikat Remote Keyless",
    desc: "Layanan duplikat remote keyless motor berbagai merek: Honda, Yamaha, Suzuki, Kawasaki. Proses cepat dengan alat original, hasil akurat dan terjamin.",
    highlight: "Remote keyless hilang? Kami siap bikin duplikatnya!",
    price: "Mulai Rp150.000",
    duration: "~30 menit",
  },
  {
    id: "press-rangka",
    icon: Triangle,
    title: "Press Rangka & Segitiga",
    desc: "Press rangka dan segitiga motor yang bengkok akibat kecelakaan atau beban berlebih. Menggunakan alat press hidrolik presisi tinggi untuk mengembalikan bentuk rangka seperti semula.",
    highlight: "Pengerjaan rapi, motor kembali lurus dan aman.",
    price: "Mulai Rp200.000",
    duration: "~2 jam",
  },
  {
    id: "remap-ecu",
    icon: Settings,
    title: "Setting & Remap ECU",
    desc: "Optimasi pengaturan ECU motor untuk performa maksimal. Remapping custom sesuai kebutuhan: harian, balap, atau touring. Buka limit RPM, atur fueling, timing, dan parameter lainnya.",
    highlight: "Didukung software terbaru untuk berbagai tipe ECU.",
    price: "Mulai Rp350.000",
    duration: "~1,5 jam",
  },
  {
    id: "dyno-test",
    icon: Gauge,
    title: "Dyno Test",
    desc: "Ukur performa motor secara akurat dengan dyno test. Dapatkan grafik tenaga (HP) & torsi (Nm) sebelum dan sesudah modifikasi. Wajib buat yang serius ngoprek mesin!",
    highlight: "Cocok setelah bore-up, stroker, atau remap ECU.",
    price: "Mulai Rp150.000",
    duration: "~30 menit",
  },
  {
    id: "tire-changer",
    icon: Truck,
    title: "Bongkar Pasang Ban dengan Tire Changer",
    desc: "Ganti ban motor dengan alat tire changer profesional. Proses cepat, aman untuk velg, dan presisi. Tidak perlu khawatir baret velg atau ring ban tidak rapi.",
    highlight: "Semua ukuran ban motor, dari skutik sampai sport.",
    price: "Mulai Rp25.000/ban",
    duration: "~15 menit/ban",
  },
  {
    id: "bubut",
    icon: Drill,
    title: "Teknik Bubut",
    desc: "Layanan bubut presisi untuk komponen motor: bubut tromol, bubut cakram, bubut noken as (camshaft), bubut dudukan kruk as, hingga pembuatan part custom. Dikerjakan mekanik berpengalaman.",
    highlight: "Mesin bubut manual & CNC untuk hasil presisi tinggi.",
    price: "Mulai Rp50.000",
    duration: "Tergantung kerumitan",
  },
];

export default function ServicesPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Layanan Lengkap"
        title="Layanan Profesional RR MOTOR"
        description="Dari servis ringan hingga modifikasi berat, semua dikerjakan oleh mekanik berpengalaman dengan alat modern dan standar kualitas tinggi."
      />

      {/* Service Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Card key={s.id} className="group relative overflow-hidden transition-all hover:neon-border hover:-translate-y-1">
            {/* Glow hover effect */}
            <div className="pointer-events-none absolute -inset-20 bg-[radial-gradient(circle_at_50%_0%,rgba(45,255,136,0.06),transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100" />

            <span className="grid h-12 w-12 place-items-center rounded-xl neon-border bg-neon/5">
              <s.icon className="h-6 w-6 neon-text" />
            </span>

            <h3 className="mt-5 text-lg font-bold">{s.title}</h3>

            <p className="mt-2 text-sm text-muted leading-relaxed">{s.desc}</p>

            <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-2">
              <p className="text-xs text-light">
                <span className="neon-text font-medium">✦</span> {s.highlight}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <div className="space-y-1">
                <span className="block text-sm font-semibold neon-text">{s.price}</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" /> {s.duration}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
                Detail <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <section className="my-16">
        <Card className="flex flex-col items-center gap-4 border-line p-8 text-center sm:p-12">
          <Wrench className="h-10 w-10 neon-text" />
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Butuh Konsultasi <span className="neon-text">Sebelum Servis?</span>
          </h2>
          <p className="max-w-lg text-muted">
            Tim mekanik kami siap membantu kamu menentukan layanan yang paling sesuai dengan kebutuhan motormu. 
            Chat langsung atau booking sekarang!
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="glow-btn rounded-xl px-5 py-3 text-sm font-semibold hover:glow-btn-hover"
            >
              Booking Sekarang
            </Link>
            <Link
              href="/modif"
              className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-light hover:border-neon hover:text-neon"
            >
              Lihat Modif Corner
            </Link>
          </div>
        </Card>
      </section>
    </Container>
  );
}