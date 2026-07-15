"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Package, Grid3X3, List } from "lucide-react";
import { Container, PageHeader } from "@/components/ui";
import { getSparepartIcon, getSparepartImage } from "@/lib/sparepart";
import { stripHtml } from "@/lib/sanitize";
import { useSparepartFilter, useSparepartList, useViewMode, CATEGORIES } from "@/hooks/use-sparepart";

export default function SparepartPage() {
  const { category, search, setCategory, setSearch, filters } = useSparepartFilter();
  const { viewMode, toggleView } = useViewMode();
  const { spareparts, isLoading } = useSparepartList(filters);

  return (
    <Container>
      <PageHeader eyebrow="SPAREPART · Katalog" title="Sparepart Motor" description="Temukan sparepart dan aksesoris motor lengkap untuk semua tipe. Harga transparan, kualitas terjamin." />

      {/* Filter & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${category === cat ? "neon-border bg-neon/10 neon-text font-medium" : "border border-line text-muted hover:text-light"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Cari sparepart..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none sm:w-56"
            />
          </div>
          <button
            onClick={toggleView}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-light"
            title={viewMode === "grid" ? "Tampilan list" : "Tampilan grid"}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-6 text-muted">Memuat sparepart...</p>}

      {/* Grid View */}
      {spareparts && viewMode === "grid" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {spareparts.map((item) => {
            const Icon = getSparepartIcon(item.name, item.category);
            return (
              <Link key={item.id} href={`/sparepart/${item.id}`} className="glass group rounded-2xl p-4 transition-colors hover:neon-border">
                {item.imageUrl || getSparepartImage(item.name) ? (
                  <div className="relative h-40 w-full rounded-xl overflow-hidden">
                    <Image src={item.imageUrl || getSparepartImage(item.name)} alt={item.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="grid h-40 place-items-center rounded-xl bg-surface-2">
                    <Icon className="h-14 w-14 text-muted" />
                  </div>
                )}
                <div className="mt-4">
                  <span className="rounded-full bg-neon/10 px-2 py-0.5 text-[10px] neon-text">{item.category}</span>
                  <h3 className="mt-2 font-semibold leading-tight">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted line-clamp-2">{stripHtml(item.description) || "—"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold neon-text">Rp {item.price.toLocaleString()}</span>
                    <span className={`text-xs ${item.stock > 0 ? "text-neon" : "text-magenta"}`}>{item.stock > 0 ? `${item.stock} tersedia` : "Habis"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* List View */}
      {spareparts && viewMode === "list" && (
        <div className="mt-6 space-y-3">
          {spareparts.map((item) => {
            const Icon = getSparepartIcon(item.name, item.category);
            return (
              <Link key={item.id} href={`/sparepart/${item.id}`} className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:neon-border">
                {item.imageUrl || getSparepartImage(item.name) ? (
                  <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden">
                    <Image src={item.imageUrl || getSparepartImage(item.name)} alt={item.name} fill sizes="(max-width: 640px) 64px, 64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-surface-2">
                    <Icon className="h-8 w-8 text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-neon/10 px-2 py-0.5 text-[10px] neon-text">{item.category}</span>
                  <h3 className="mt-1 font-semibold">{item.name}</h3>
                  <p className="truncate text-xs text-muted">{stripHtml(item.description) || "—"}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold neon-text">Rp {item.price.toLocaleString()}</div>
                  <div className={`text-xs ${item.stock > 0 ? "text-neon" : "text-magenta"}`}>{item.stock > 0 ? `${item.stock} tersedia` : "Habis"}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {spareparts?.length === 0 && (
        <div className="mt-10 text-center text-muted">
          <Package className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-3">Tidak ada sparepart ditemukan</p>
        </div>
      )}
    </Container>
  );
}