import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
// Hanya izinkan format gambar; ekstensi ditentukan dari MIME agar aman.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// POST /api/upload — simpan foto dari kamera tablet mekanik ke public/uploads.
export async function POST(req: Request) {
  const auth = await requireRole(["MECHANIC", "ADMIN"]);
  if (isUnauthorized(auth)) return auth.response;

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File kosong" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran maksimal 5 MB" }, { status: 400 });
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    // Nama acak (UUID) agar tidak ada tabrakan / path traversal.
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, filename), buf);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
