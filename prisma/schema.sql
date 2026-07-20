-- ============================================================
-- RR MOTOR — Database Schema for Supabase (PostgreSQL)
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. TABEL UTAMA

-- Pengguna (remaja / anak motor)
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mekanik (admin / POS)
CREATE TABLE IF NOT EXISTS "Mechanic" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  shift TEXT NOT NULL
);

-- Antrean / booking servis
CREATE TABLE IF NOT EXISTS "Booking" (
  id SERIAL PRIMARY KEY,
  queue_number TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  motor TEXT NOT NULL,
  plate TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Menunggu',
  base_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id INTEGER REFERENCES "User"(id),
  mechanic_id INTEGER REFERENCES "Mechanic"(id)
);

-- Temuan kerusakan tambahan dari mekanik (Digital Billing)
CREATE TABLE IF NOT EXISTS "Finding" (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT NOT NULL,
  price INTEGER NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Portofolio hasil modifikasi (Modif Corner feed)
CREATE TABLE IF NOT EXISTS "Portfolio" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL,
  grad TEXT NOT NULL
);

-- Katalog RR Points
CREATE TABLE IF NOT EXISTS "Reward" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  icon TEXT NOT NULL,
  tag TEXT NOT NULL
);

-- Riwayat penukaran poin
CREATE TABLE IF NOT EXISTS "Redemption" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id),
  reward_id INTEGER NOT NULL REFERENCES "Reward"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Akun login (admin, mekanik, customer)
CREATE TABLE IF NOT EXISTS "Account" (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  user_id INTEGER REFERENCES "User"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Katalog sparepart motor
CREATE TABLE IF NOT EXISTS "Sparepart" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transaksi penjualan sparepart (kasir)
CREATE TABLE IF NOT EXISTS "Transaction" (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  total INTEGER NOT NULL,
  cash INTEGER NOT NULL DEFAULT 0,
  change INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Presensi pengunjung anonim (guest) yang sedang online
CREATE TABLE IF NOT EXISTS "VisitorSession" (
  id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_visitorsession_last_seen ON "VisitorSession"(last_seen);

-- Item dalam transaksi sparepart
CREATE TABLE IF NOT EXISTS "TransactionItem" (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES "Transaction"(id) ON DELETE CASCADE,
  sparepart_id INTEGER NOT NULL REFERENCES "Sparepart"(id),
  quantity INTEGER NOT NULL,
  price_at_sale INTEGER NOT NULL
);

-- 2. FUNCTION: Reset sequence auto-increment
CREATE OR REPLACE FUNCTION reset_sequences()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM setval('"User_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "User"));
  PERFORM setval('"Account_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Account"));
  PERFORM setval('"Mechanic_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Mechanic"));
  PERFORM setval('"Booking_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Booking"));
  PERFORM setval('"Finding_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Finding"));
  PERFORM setval('"Portfolio_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Portfolio"));
  PERFORM setval('"Reward_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Reward"));
  PERFORM setval('"Redemption_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Redemption"));
  PERFORM setval('"Sparepart_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Sparepart"));
  PERFORM setval('"Transaction_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Transaction"));
  PERFORM setval('"TransactionItem_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "TransactionItem"));
END;
$$;

-- ============================================================
-- Selesai. Semua tabel sudah dibuat.
-- Jalankan prisma/seed.sql untuk mengisi data awal.
-- ============================================================