import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
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
