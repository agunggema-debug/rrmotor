import { type LucideIcon, Package, Cog, Shield, Disc, Zap, Star, Droplets, Wrench, Lightbulb, Battery, Eye, Lock, Circle, Wind, Link } from "lucide-react";

const NAME_ICON_MAP: [string, LucideIcon][] = [
  ["oli", Droplets],
  ["gardan", Droplets],
  ["kampas", Disc],
  ["rem", Disc],
  ["cakram", Disc],
  ["busi", Zap],
  ["filter", Wind],
  ["lampu", Lightbulb],
  ["led", Lightbulb],
  ["aki", Battery],
  ["spion", Eye],
  ["handle", Wrench],
  ["grip", Wrench],
  ["stiker", Star],
  ["kunci", Lock],
  ["gembok", Lock],
  ["tali", Link],
  ["sarung", Shield],
  ["jok", Shield],
  ["roller", Circle],
  ["v-belt", Circle],
  ["belt", Circle],
];

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Mesin: Cog,
  Body: Shield,
  "Kaki-kaki": Disc,
  Kelistrikan: Zap,
  Aksesoris: Star,
  "Oli & Cairan": Droplets,
};

const NAME_IMAGE_MAP: Record<string, string> = {
  "Oli Mesin AHM 0.8L": "/images/oli-mesin-ahm-0.8l.jfif",
  "Oli Mesin MPX 1L": "/images/oli-mesin-mpx-1l.jfif",
  "Oli Gardan AHM 150ml": "/images/oli-gardan-ahm-150ml.jfif",
  "Kampas Rem Depan AHM": "/images/kampas-rem-depan-ahm.jfif",
  "Kampas Rem Belakang AHM": "/images/kampas-rem-belakang-ahm.jpg",
  "Busi NGK CPR8EA": "/images/busi-ngk-cpr8ea.avif",
  "Filter Udara AHM": "/images/filter-udara-ahm.webp",
  "V-Belt AHM": "/images/v-belt-ahm.webp",
  "Roller AHM 13gr": "/images/roller-ahm-13gr.jfif",
  "Lampu LED Depan H4": "/images/lampu-led-depan-h4.jpg",
  "Lampu LED Senja T10": "/images/lampu-led-senja-t10.jfif",
  "Aki GS GTZ5S": "/images/aki-gs-gtz5s.webp",
  "Spion Retro Bulat": "/images/spion-retro-bulat.jfif",
  "Handle Grip ProGrip": "/images/handle-grip-progrip.jfif",
  "Stiker Reflektif RR": "/images/stiker-rflektif-rr.png",
  "Kunci Gembok Brem": "/images/kunci-gembok-brem.jpg",
  "Tali Leher Masker": "/images/tali-leher-masker.webp",
  "Sarung Jok Custom": "/images/sarung-jok-custom.jpg",
};

export function getSparepartImage(name: string): string {
  return NAME_IMAGE_MAP[name] || "";
}

export function getSparepartIcon(name: string, category: string): LucideIcon {
  const lowerName = name.toLowerCase();
  const match = NAME_ICON_MAP.find(([keyword]) => lowerName.includes(keyword));
  if (match) {
    return match[1];
  }
  return CATEGORY_ICON_MAP[category] || Package;
}
