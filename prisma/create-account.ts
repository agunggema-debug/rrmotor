import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "../src/lib/password";
import { PrismaClient } from "@prisma/client";

const ROLES = ["ADMIN", "MECHANIC", "KASIR", "CUSTOMER"] as const;
type Role = (typeof ROLES)[number];

async function loadEnv() {
  if (process.env.DATABASE_URL) return;
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

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditemukan (cek file .env)");
  }

  const prisma = new PrismaClient();

  const username = (process.argv[2] || "kasir").toLowerCase();
  const password = process.argv[3] || "kasir123";
  const roleArg = (process.argv[4] || "KASIR").toUpperCase();
  const role = (ROLES.includes(roleArg as Role) ? roleArg : "KASIR") as Role;

  const passwordHash = await hashPassword(password);

  const account = await prisma.account.upsert({
    where: { username },
    update: { passwordHash, role },
    create: { username, passwordHash, role },
  });

  console.log(
    `Akun siap: username=${account.username} role=${account.role} (id=${account.id})`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
