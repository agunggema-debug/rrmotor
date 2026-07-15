import { NextResponse } from "next/server";

// Error dengan status HTTP eksplisit untuk validasi input.
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Handler error terpusat: log di server (tanpa bocor ke client),
// kembalikan pesan generik 500 agar tidak membocorkan detail/PII.
export function serverError(e: unknown): NextResponse {
  console.error("[API] Unhandled error:", e);
  return NextResponse.json(
    { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
    { status: 500 }
  );
}
