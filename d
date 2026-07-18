-- RR Motor Seed Data
-- Run this after init.sql in Supabase SQL Editor

INSERT INTO "User" (name, phone, points) VALUES
('Bagas', '0812-3456-7890', 145);

INSERT INTO "Mechanic" (name, shift) VALUES
('Bro Andi', '15.00–21.00');

INSERT INTO "Portfolio" (title, tag, grad) VALUES
('Vario 160 · Neon Wrap', 'Estetik', 'from-neon/40 to-electric/40'),
('NMAX · Big Bore Kit', 'Performa', 'from-magenta/40 to-electric/40'),
('Beat · LED Underglow', 'Estetik', 'from-electric/40 to-neon/40'),
('CB150R · Custom Seat', 'Estetik', 'from-neon/40 to-magenta/40'),
('Scoopy · Airbrush Anime', 'Cat', 'from-magenta/40 to-neon/40'),
('PCX · Suspensi VIP', 'Performa', 'from-electric/40 to-neon/40');

INSERT INTO "Reward" (name, cost, icon, tag) VALUES
('Diskon Oli 1L', 50, 'Droplet', 'Diskon'),
('Stiker Eksklusif RR', 30, 'Sticker', 'Merch'),
('Kaos RR Motor', 120, 'Shirt', 'Merch'),
('Kopi Gratis (Area Tunggu)', 20, 'Coffee', 'Fasilitas'),
('Voucher Servis Rp50.000', 200, 'Gift', 'Diskon'),
('Jaket Varial Motor', 350, 'Shirt', 'Merch');

INSERT INTO "Sparepart" (name, category, price, stock, description) VALUES
('Oli Mesin AHM 0.8L', 'Oli & Cairan', 55000, 25, 'Oli mesin motor matic 4T 0.8L, cocok untuk Vario/Beat/Scoopy.'),
('Oli Mesin MPX 1L', 'Oli & Cairan', 65000, 20, 'Oli mesin motor bebek & sport 1L.'),
('Oli Gardan AHM 150ml', 'Oli & Cairan', 25000, 30, 'Oli gardan untuk motor matic.'),
('Kampas Rem Depan AHM', 'Kaki-kaki', 75000, 15, 'Kampas rem depan original AHM untuk Vario/Beat.'),
('Kampas Rem Belakang AHM', 'Kaki-kaki', 65000, 12, 'Kampas rem belakang original AHM.'),
('Busi NGK CPR8EA', 'Mesin', 35000, 40, 'Busi standar untuk Vario 160, PCX, NMAX.'),
('Filter Udara AHM', 'Mesin', 40000, 18, 'Filter udara motor matic original AHM.'),
('V-Belt AHM', 'Mesin', 120000, 10, 'V-Belt original untuk CVT motor matic.'),
('Roller AHM 13gr', 'Mesin', 45000, 22, 'Roller CVT 13gr untuk performa standar.'),
('Lampu LED Depan H4', 'Kelistrikan', 85000, 14, 'Lampu LED H4 6000K putih terang.'),
('Lampu LED Senja T10', 'Kelistrikan', 25000, 35, 'Lampu senja LED T10 kecil.'),
('Aki GS GTZ5S', 'Kelistrikan', 180000, 8, 'Aki kering GS untuk motor matic.'),
('Spion Retro Bulat', 'Body', 55000, 10, 'Spion retro bulat, cocok untuk modif klasik.'),
('Handle Grip ProGrip', 'Body', 65000, 16, 'Handle grip karet premium, nyaman digenggam.'),
('Stiker Reflektif RR', 'Aksesoris', 15000, 50, 'Stiker reflektif neon RR MOTOR.'),
('Kunci Gembok Brem', 'Aksesoris', 45000, 12, 'Kunci gembok rem cakram anti maling.'),
('Tali Leher Masker', 'Aksesoris', 10000, 30, 'Tali leher masker muka, cocok untuk daily riding.'),
('Sarung Jok Custom', 'Body', 90000, 6, 'Sarung jok motor anti panas.');