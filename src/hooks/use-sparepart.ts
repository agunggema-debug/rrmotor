// Custom hooks untuk pemisahan concerns di frontend
// Mengikuti prinsip Separation of Concerns & DRY

import { useState, useMemo } from "react";
import useSWR from "swr";
import type { Sparepart } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const CATEGORIES = ["Semua", "Mesin", "Body", "Kaki-kaki", "Kelistrikan", "Aksesoris", "Oli & Cairan"] as const;
export type Category = typeof CATEGORIES[number];

/**
 * Hook untuk mengelola filter sparepart (category & search)
 */
export function useSparepartFilter() {
  const [category, setCategory] = useState<Category>("Semua");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => {
    const params = new URLSearchParams();
    if (category !== "Semua") params.set("category", category);
    if (search) params.set("search", search);
    return params.toString();
  }, [category, search]);

  return {
    category,
    setCategory,
    search,
    setSearch,
    filters,
  };
}

/**
 * Hook untuk fetch data sparepart dengan filter
 */
export function useSparepartList(filters: string) {
  const { data, isLoading, error, mutate } = useSWR<Sparepart[]>(
    `/api/sparepart?${filters}`,
    fetcher
  );

  return {
    spareparts: data ?? [],
    isLoading,
    error,
    mutate,
    isEmpty: data?.length === 0,
  };
}

/**
 * Hook untuk mengelola view mode (grid/list)
 */
export function useViewMode() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleView = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  return {
    viewMode,
    setViewMode,
    toggleView,
  };
}