import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireRole, isUnauthorized } from "@/lib/auth";
import { serverError } from "@/lib/http";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Magic bytes for image validation
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])], // RIFF header
  "image/gif": [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
  "image/avif": [new Uint8Array([0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66])],
};

function validateMagicBytes(buf: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => {
    if (buf.length < sig.length) return false;
    return sig.every((byte, i) => buf[i] === byte);
  });
}

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

    // Validate file content using magic bytes (not just MIME type)
    if (!validateMagicBytes(new Uint8Array(buf), file.type)) {
      return NextResponse.json(
        { error: "Konten file tidak sesuai dengan tipe yang diklaim" },
        { status: 400 }
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const path = `${filename}`;

    const sb = getSupabase();
    const { error } = await sb.storage
      .from("uploads")
      .upload(path, buf, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = sb.storage.from("uploads").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
