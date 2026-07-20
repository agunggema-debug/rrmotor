import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "../src/lib/password";
import { getSupabase } from "../src/lib/supabase";

const ROLES = ["ADMIN", "MECHANIC", "KASIR", "CUSTOMER"] as const;
type Role = (typeof ROLES)[number];

async function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const envPath = path.resolve(process.cwd(), ".env");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // abaikan jika .env tidak ditemukan
  }
}

async function main() {
  await loadEnv();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus di-set (cek file .env)"
    );
  }

  const supabase = getSupabase();

  const username = (process.argv[2] || "kasir").toLowerCase();
  const password = process.argv[3] || "kasir123";
  const roleArg = (process.argv[4] || "KASIR").toUpperCase();
  const role = (ROLES.includes(roleArg as Role) ? roleArg : "KASIR") as Role;

  const passwordHash = await hashPassword(password);

  // Cek apakah akun sudah ada
  const { data: existing } = await supabase
    .from("Account")
    .select("*")
    .eq("username", username)
    .single();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("Account")
      .update({ password_hash: passwordHash, role })
      .eq("username", username)
      .select("*")
      .single();

    if (error) throw error;
    console.log(
      `Akun diupdate: username=${updated.username} role=${updated.role} (id=${updated.id})`
    );
  } else {
    const { data: created, error } = await supabase
      .from("Account")
      .insert({ username, password_hash: passwordHash, role })
      .select("*")
      .single();

    if (error) throw error;
    console.log(
      `Akun dibuat: username=${created.username} role=${created.role} (id=${created.id})`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});