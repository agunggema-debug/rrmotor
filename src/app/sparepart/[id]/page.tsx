"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Package, ArrowLeft, ShoppingCart, Clock, Tag } from "lucide-react";
import { Container, Card } from "@/components/ui";
import type { Sparepart } from "@/lib/types";
import { getSparepartIcon, getSparepartImage } from "@/lib/sparepart";
import { stripHtml } from "@/lib/sanitize";
import Image from "next/image";

import { fetcher } from "@/lib/fetcher";

export default function SparepartDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const { data, isLoading } = useSWR<Sparepart>(
    `/api/sparepart/${id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <Container>
        <p className="py-10 text-muted">Memuat detail sparepart...</p>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <div className="py-10 text-center text-muted">
          <Package className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-3">Sparepart tidak ditemukan</p>
          <Link
            href="/sparepart"
            className="mt-4 inline-flex items-center gap-1 text-sm neon-text hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6">
        <Link
          href="/sparepart"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-light"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid relative h-64 place-items-center rounded-3xl neon-border glass sm:h-80 lg:h-96 overflow-hidden">
          {data.imageUrl || getSparepartImage(data.name) ? (
            <Image
              src={data.imageUrl || getSparepartImage(data.name)}
              alt={data.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (() => {
            const Icon = getSparepartIcon(data.name, data.category);
            return <Icon className="h-24 w-24 text-muted sm:h-32 sm:w-32" />;
          })()}
        </div>

        <div>
          <span className="rounded-full bg-neon/10 px-3 py-1 text-xs neon-text">
            {data.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {data.name}
          </h1>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl font-bold neon-text">
              Rp {data.price.toLocaleString()}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Package className="h-4 w-4 text-muted" />
              <span
                className={data.stock > 0 ? "text-neon" : "text-magenta"}
              >
                {data.stock > 0
                  ? `Stok: ${data.stock} unit`
                  : "Stok habis"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <Clock className="h-4 w-4 text-muted" />
              <span>
                Diperbarui{" "}
                {new Date(data.updatedAt).toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>

          <Card className="mt-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <Tag className="h-4 w-4 neon-text" /> Deskripsi
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {stripHtml(data.description) || "Tidak ada deskripsi untuk sparepart ini."}
            </p>
          </Card>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sparepart"
              className="flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-light hover:border-neon hover:text-neon"
            >
              <ShoppingCart className="h-4 w-4" /> Beli di Toko
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
