import { getSupabase } from "../src/lib/supabase";
import { hashPassword } from "../src/lib/password";

async function main() {
  const supabase = getSupabase();

  // Bersihkan data (urutan penting untuk foreign key)
  await supabase.from("Redemption").delete().neq("id", 0);
  await supabase.from("TransactionItem").delete().neq("id", 0);
  await supabase.from("Transaction").delete().neq("id", 0);
  await supabase.from("Sparepart").delete().neq("id", 0);
  await supabase.from("Finding").delete().neq("id", 0);
  await supabase.from("Booking").delete().neq("id", 0);
  await supabase.from("Portfolio").delete().neq("id", 0);
  await supabase.from("Reward").delete().neq("id", 0);
  await supabase.from("Account").delete().neq("id", 0);
  await supabase.from("Mechanic").delete().neq("id", 0);
  await supabase.from("User").delete().neq("id", 0);
  await supabase.from("VisitorSession").delete().neq("id", "");
  
  // Reset sequence (PostgreSQL)
  await supabase.rpc("reset_sequences");

  const hash = async (p: string) => hashPassword(p);

  // 1. USERS
  const { data: bagas } = await supabase
    .from("User")
    .insert({ id: 1, name: "Bagas", phone: "0812-3456-7890", points: 145 })
    .select("*")
    .single();

  if (!bagas) throw new Error("Failed to create user");

  // 2. ACCOUNTS
  await supabase.from("Account").insert([
    { id: 1, username: "admin", password_hash: await hash("admin123"), role: "ADMIN", user_id: null },
    { id: 2, username: "mekanik", password_hash: await hash("mekanik123"), role: "MECHANIC", user_id: null },
    { id: 3, username: "kasir", password_hash: await hash("kasir123"), role: "KASIR", user_id: null },
    { id: 4, username: "bagas", password_hash: await hash("bagas123"), role: "CUSTOMER", user_id: bagas.id },
  ]);

  // 3. MECHANICS
  const { data: andi } = await supabase
    .from("Mechanic")
    .insert({ id: 1, name: "Bro Andi", shift: "15.00–21.00" })
    .select("*")
    .single();

  if (!andi) throw new Error("Failed to create mechanic");

  // 4. BOOKINGS
  await supabase.from("Booking").insert([
    {
      id: 1,
      queue_number: "A-12",
      owner_name: "Bagas",
      motor: "Vario 160",
      plate: "B 1234 RR",
      service_type: "Servis Besar",
      appointment_date: "Sel, 14 Jul",
      appointment_time: "15:00",
      status: "Dikerjakan",
      base_price: 250000,
      user_id: bagas.id,
      mechanic_id: andi.id,
    },
    {
      id: 2,
      queue_number: "A-13",
      owner_name: "Siti",
      motor: "Beat",
      plate: "B 5567 ST",
      service_type: "Servis Ringan",
      appointment_date: "Sel, 14 Jul",
      appointment_time: "16:00",
      status: "Menunggu",
      base_price: 75000,
    },
    {
      id: 3,
      queue_number: "A-14",
      owner_name: "Andi",
      motor: "NMAX",
      plate: "B 7781 ND",
      service_type: "Upgrade Performa",
      appointment_date: "Sel, 14 Jul",
      appointment_time: "17:00",
      status: "Test Drive",
      base_price: 500000,
      mechanic_id: andi.id,
    },
  ]);

  // 5. FINDINGS
  await supabase.from("Finding").insert([
    {
      id: 1,
      booking_id: 1,
      name: "Kampas Rem Belakang",
      note: "Tebal sisa 1mm, disarankan ganti.",
      price: 85000,
      photo_url: null,
      status: "pending",
    },
    {
      id: 2,
      booking_id: 1,
      name: "Oli Mesin 1L",
      note: "Sudah 2.500 km, waktunya ganti.",
      price: 70000,
      photo_url: null,
      status: "pending",
    },
    {
      id: 3,
      booking_id: 3,
      name: "Rolling Speed",
      note: "Tambah rolling untuk respons gas.",
      price: 150000,
      photo_url: null,
      status: "approved",
    },
  ]);

  // 6. PORTFOLIOS
  await supabase.from("Portfolio").insert([
    { id: 1, title: "Vario 160 · Neon Wrap", tag: "Estetik", grad: "from-neon/40 to-electric/40" },
    { id: 2, title: "NMAX · Big Bore Kit", tag: "Performa", grad: "from-magenta/40 to-electric/40" },
    { id: 3, title: "Beat · LED Underglow", tag: "Estetik", grad: "from-electric/40 to-neon/40" },
    { id: 4, title: "CB150R · Custom Seat", tag: "Estetik", grad: "from-neon/40 to-magenta/40" },
    { id: 5, title: "Scoopy · Airbrush Anime", tag: "Cat", grad: "from-magenta/40 to-neon/40" },
    { id: 6, title: "PCX · Suspensi VIP", tag: "Performa", grad: "from-electric/40 to-neon/40" },
  ]);

  // 7. REWARDS
  await supabase.from("Reward").insert([
    { id: 1, name: "Diskon Oli 1L", cost: 50, icon: "Droplet", tag: "Diskon" },
    { id: 2, name: "Stiker Eksklusif RR", cost: 30, icon: "Sticker", tag: "Merch" },
    { id: 3, name: "Kaos RR Motor", cost: 120, icon: "Shirt", tag: "Merch" },
    { id: 4, name: "Kopi Gratis (Area Tunggu)", cost: 20, icon: "Coffee", tag: "Fasilitas" },
    { id: 5, name: "Voucher Servis Rp50.000", cost: 200, icon: "Gift", tag: "Diskon" },
    { id: 6, name: "Jaket Varial Motor", cost: 350, icon: "Shirt", tag: "Merch" },
  ]);

  // 8. SPAREPARTS
  await supabase.from("Sparepart").insert([
    { id: 1, name: "Oli Mesin AHM 0.8L", category: "Oli & Cairan", price: 55000, stock: 25, description: "Oli mesin motor matic 4T 0.8L, cocok untuk Vario/Beat/Scoopy.", image_url: "" },
    { id: 2, name: "Oli Mesin MPX 1L", category: "Oli & Cairan", price: 65000, stock: 20, description: "Oli mesin motor bebek & sport 1L.", image_url: "" },
    { id: 3, name: "Oli Gardan AHM 150ml", category: "Oli & Cairan", price: 25000, stock: 30, description: "Oli gardan untuk motor matic.", image_url: "" },
    { id: 4, name: "Kampas Rem Depan AHM", category: "Kaki-kaki", price: 75000, stock: 15, description: "Kampas rem depan original AHM untuk Vario/Beat.", image_url: "" },
    { id: 5, name: "Kampas Rem Belakang AHM", category: "Kaki-kaki", price: 65000, stock: 12, description: "Kampas rem belakang original AHM.", image_url: "" },
    { id: 6, name: "Busi NGK CPR8EA", category: "Mesin", price: 35000, stock: 40, description: "Busi standar untuk Vario 160, PCX, NMAX.", image_url: "" },
    { id: 7, name: "Filter Udara AHM", category: "Mesin", price: 40000, stock: 18, description: "Filter udara motor matic original AHM.", image_url: "" },
    { id: 8, name: "V-Belt AHM", category: "Mesin", price: 120000, stock: 10, description: "V-Belt original untuk CVT motor matic.", image_url: "" },
    { id: 9, name: "Roller AHM 13gr", category: "Mesin", price: 45000, stock: 22, description: "Roller CVT 13gr untuk performa standar.", image_url: "" },
    { id: 10, name: "Lampu LED Depan H4", category: "Kelistrikan", price: 85000, stock: 14, description: "Lampu LED H4 6000K putih terang.", image_url: "" },
    { id: 11, name: "Lampu LED Senja T10", category: "Kelistrikan", price: 25000, stock: 35, description: "Lampu senja LED T10 kecil.", image_url: "" },
    { id: 12, name: "Aki GS GTZ5S", category: "Kelistrikan", price: 180000, stock: 8, description: "Aki kering GS untuk motor matic.", image_url: "" },
    { id: 13, name: "Spion Retro Bulat", category: "Body", price: 55000, stock: 10, description: "Spion retro bulat, cocok untuk modif klasik.", image_url: "" },
    { id: 14, name: "Handle Grip ProGrip", category: "Body", price: 65000, stock: 16, description: "Handle grip karet premium, nyaman digenggam.", image_url: "" },
    { id: 15, name: "Stiker Reflektif RR", category: "Aksesoris", price: 15000, stock: 50, description: "Stiker reflektif neon RR MOTOR.", image_url: "" },
    { id: 16, name: "Kunci Gembok Brem", category: "Aksesoris", price: 45000, stock: 12, description: "Kunci gembok rem cakram anti maling.", image_url: "" },
    { id: 17, name: "Tali Leher Masker", category: "Aksesoris", price: 10000, stock: 30, description: "Tali leher masker muka, cocok untuk daily riding.", image_url: "" },
    { id: 18, name: "Sarung Jok Custom", category: "Body", price: 90000, stock: 6, description: "Sarung jok motor anti panas.", image_url: "" },
  ]);

  console.log("Seed selesai ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });