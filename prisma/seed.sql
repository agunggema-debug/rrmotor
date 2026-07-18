-- ============================================================
-- SEED DATA untuk RR MOTOR
-- Jalankan di Supabase Dashboard → SQL Editor
-- Urutan sudah diatur agar foreign key constraints terpenuhi
-- ============================================================

-- 1. USERS
INSERT INTO "User" (id, name, phone, points, "createdAt") VALUES
(1, 'Bagas', '0812-3456-7890', 145, NOW());

-- 2. ACCOUNTS (password di-hash dengan Argon2id)
INSERT INTO "Account" (id, username, "passwordHash", role, "userId", "createdAt") VALUES
(1, 'admin',    '$argon2id$v=19$m=65536,t=2,p=2$klSDc3mVGqTeYMn4TYpVng$EtlvnbWuFj22JdBJP4VnY8X0Nsj2EDBqHo/bYDd50SQ', 'ADMIN',    NULL, NOW()),
(2, 'mekanik',  '$argon2id$v=19$m=65536,t=2,p=2$HQKEVv4ISQ8bFHnRrqvExQ$kv7UIdCELIEFfoEhi/cdeCPPJXP35jZIjUdJikbfMVU', 'MECHANIC', NULL, NOW()),
(3, 'kasir',    '$argon2id$v=19$m=65536,t=2,p=2$J59nHRG094Gsx10x9BJY5g$32iaMeLukZ5pZOJP3v15R2IDL2VqnHCuTTeEJe6m+is', 'KASIR',    NULL, NOW()),
(4, 'bagas',    '$argon2id$v=19$m=65536,t=2,p=2$cc/hqZLnuuybhAc7ejHAeA$jHXDsPufFIBxR3/yYUnyulcWR9OQe8c92cwXJztlkrI', 'CUSTOMER', 1,    NOW());

-- 3. MECHANICS
INSERT INTO "Mechanic" (id, name, shift) VALUES
(1, 'Bro Andi', '15.00–21.00');

-- 4. BOOKINGS
INSERT INTO "Booking" (id, "queueNumber", "ownerName", motor, plate, "serviceType", "appointmentDate", "appointmentTime", status, "basePrice", "createdAt", "userId", "mechanicId") VALUES
(1, 'A-12', 'Bagas', 'Vario 160', 'B 1234 RR', 'Servis Besar', 'Sel, 14 Jul', '15:00', 'Dikerjakan', 250000, NOW(), 1, 1),
(2, 'A-13', 'Siti',  'Beat',      'B 5567 ST', 'Servis Ringan', 'Sel, 14 Jul', '16:00', 'Menunggu',   75000,  NOW(), NULL, NULL),
(3, 'A-14', 'Andi',  'NMAX',      'B 7781 ND', 'Upgrade Performa', 'Sel, 14 Jul', '17:00', 'Test Drive', 500000, NOW(), NULL, 1);

-- 5. FINDINGS
INSERT INTO "Finding" (id, "bookingId", name, note, price, "photoUrl", status) VALUES
(1, 1, 'Kampas Rem Belakang', 'Tebal sisa 1mm, disarankan ganti.', 85000,  NULL, 'pending'),
(2, 1, 'Oli Mesin 1L',        'Sudah 2.500 km, waktunya ganti.',   70000,  NULL, 'pending'),
(3, 3, 'Rolling Speed',       'Tambah rolling untuk respons gas.',  150000, NULL, 'approved');

-- 6. PORTFOLIOS
INSERT INTO "Portfolio" (id, title, tag, grad) VALUES
(1, 'Vario 160 · Neon Wrap',   'Estetik',  'from-neon/40 to-electric/40'),
(2, 'NMAX · Big Bore Kit',     'Performa', 'from-magenta/40 to-electric/40'),
(3, 'Beat · LED Underglow',    'Estetik',  'from-electric/40 to-neon/40'),
(4, 'CB150R · Custom Seat',    'Estetik',  'from-neon/40 to-magenta/40'),
(5, 'Scoopy · Airbrush Anime', 'Cat',      'from-magenta/40 to-neon/40'),
(6, 'PCX · Suspensi VIP',      'Performa', 'from-electric/40 to-neon/40');

-- 7. REWARDS
INSERT INTO "Reward" (id, name, cost, icon, tag) VALUES
(1, 'Diskon Oli 1L',            50,  'Droplet', 'Diskon'),
(2, 'Stiker Eksklusif RR',      30,  'Sticker', 'Merch'),
(3, 'Kaos RR Motor',            120, 'Shirt',   'Merch'),
(4, 'Kopi Gratis (Area Tunggu)', 20, 'Coffee',  'Fasilitas'),
(5, 'Voucher Servis Rp50.000',  200, 'Gift',    'Diskon'),
(6, 'Jaket Varial Motor',       350, 'Shirt',   'Merch');

-- 8. SPAREPARTS
INSERT INTO "Sparepart" (id, name, category, price, stock, description, "imageUrl", "createdAt", "updatedAt") VALUES
(1,  'Oli Mesin AHM 0.8L',     'Oli & Cairan',  55000,  25, 'Oli mesin motor matic 4T 0.8L, cocok untuk Vario/Beat/Scoopy.', '', NOW(), NOW()),
(2,  'Oli Mesin MPX 1L',       'Oli & Cairan',  65000,  20, 'Oli mesin motor bebek & sport 1L.', '', NOW(), NOW()),
(3,  'Oli Gardan AHM 150ml',   'Oli & Cairan',  25000,  30, 'Oli gardan untuk motor matic.', '', NOW(), NOW()),
(4,  'Kampas Rem Depan AHM',   'Kaki-kaki',     75000,  15, 'Kampas rem depan original AHM untuk Vario/Beat.', '', NOW(), NOW()),
(5,  'Kampas Rem Belakang AHM','Kaki-kaki',     65000,  12, 'Kampas rem belakang original AHM.', '', NOW(), NOW()),
(6,  'Busi NGK CPR8EA',        'Mesin',         35000,  40, 'Busi standar untuk Vario 160, PCX, NMAX.', '', NOW(), NOW()),
(7,  'Filter Udara AHM',       'Mesin',         40000,  18, 'Filter udara motor matic original AHM.', '', NOW(), NOW()),
(8,  'V-Belt AHM',             'Mesin',         120000, 10, 'V-Belt original untuk CVT motor matic.', '', NOW(), NOW()),
(9,  'Roller AHM 13gr',        'Mesin',         45000,  22, 'Roller CVT 13gr untuk performa standar.', '', NOW(), NOW()),
(10, 'Lampu LED Depan H4',     'Kelistrikan',   85000,  14, 'Lampu LED H4 6000K putih terang.', '', NOW(), NOW()),
(11, 'Lampu LED Senja T10',    'Kelistrikan',   25000,  35, 'Lampu senja LED T10 kecil.', '', NOW(), NOW()),
(12, 'Aki GS GTZ5S',           'Kelistrikan',   180000,  8, 'Aki kering GS untuk motor matic.', '', NOW(), NOW()),
(13, 'Spion Retro Bulat',      'Body',          55000,  10, 'Spion retro bulat, cocok untuk modif klasik.', '', NOW(), NOW()),
(14, 'Handle Grip ProGrip',    'Body',          65000,  16, 'Handle grip karet premium, nyaman digenggam.', '', NOW(), NOW()),
(15, 'Stiker Reflektif RR',    'Aksesoris',     15000,  50, 'Stiker reflektif neon RR MOTOR.', '', NOW(), NOW()),
(16, 'Kunci Gembok Brem',      'Aksesoris',     45000,  12, 'Kunci gembok rem cakram anti maling.', '', NOW(), NOW()),
(17, 'Tali Leher Masker',      'Aksesoris',     10000,  30, 'Tali leher masker muka, cocok untuk daily riding.', '', NOW(), NOW()),
(18, 'Sarung Jok Custom',      'Body',          90000,   6, 'Sarung jok motor anti panas.', '', NOW(), NOW());

-- Reset sequence auto-increment ke nilai terakhir
SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));
SELECT setval('"Account_id_seq"', (SELECT MAX(id) FROM "Account"));
SELECT setval('"Mechanic_id_seq"', (SELECT MAX(id) FROM "Mechanic"));
SELECT setval('"Booking_id_seq"', (SELECT MAX(id) FROM "Booking"));
SELECT setval('"Finding_id_seq"', (SELECT MAX(id) FROM "Finding"));
SELECT setval('"Portfolio_id_seq"', (SELECT MAX(id) FROM "Portfolio"));
SELECT setval('"Reward_id_seq"', (SELECT MAX(id) FROM "Reward"));
SELECT setval('"Sparepart_id_seq"', (SELECT MAX(id) FROM "Sparepart"));

-- ============================================================
-- Selesai. Data seed berhasil dimasukkan.
-- ============================================================