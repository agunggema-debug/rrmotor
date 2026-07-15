import { HttpError } from "@/lib/http";

// Validasi input ketat untuk mencegah XSS / data rusak.
// Melempar HttpError(400) bila tidak valid agar route bisa menangkapnya.

export function str(
  v: unknown,
  opts: { required?: boolean; max?: number; field?: string } = {}
): string {
  if (v == null || typeof v !== "string") {
    if (opts.required) {
      throw new HttpError(400, `Field ${opts.field ?? "ini"} wajib diisi`);
    }
    return "";
  }
  const s = v.trim();
  if (opts.required && s.length === 0) {
    throw new HttpError(400, `Field ${opts.field ?? "ini"} wajib diisi`);
  }
  if (opts.max != null && s.length > opts.max) {
    throw new HttpError(
      400,
      `Field ${opts.field ?? "ini"} maksimal ${opts.max} karakter`
    );
  }
  return s;
}

export function num(
  v: unknown,
  opts: {
    required?: boolean;
    min?: number;
    integer?: boolean;
    field?: string;
  } = {}
): number {
  if (v == null) {
    if (opts.required) {
      throw new HttpError(400, `Field ${opts.field ?? "ini"} wajib diisi`);
    }
    return 0;
  }
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) {
    throw new HttpError(400, `Field ${opts.field ?? "ini"} harus berupa angka`);
  }
  if (opts.integer && !Number.isInteger(n)) {
    throw new HttpError(
      400,
      `Field ${opts.field ?? "ini"} harus bilangan bulat`
    );
  }
  if (opts.min != null && n < opts.min) {
    throw new HttpError(
      400,
      `Field ${opts.field ?? "ini"} minimal ${opts.min}`
    );
  }
  return n;
}

// Hanya izinkan URL http/https (tolak javascript:, data:, dll).
export function httpUrl(v: string, field = "URL"): string {
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new HttpError(400, `${field} tidak valid`);
    }
    return v;
  } catch {
    throw new HttpError(400, `${field} tidak valid`);
  }
}

export function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
  field = "nilai"
): T {
  if (typeof v !== "string" || !allowed.includes(v as T)) {
    throw new HttpError(
      400,
      `${field} tidak valid (harus: ${allowed.join(", ")})`
    );
  }
  return v as T;
}
