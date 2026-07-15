import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.redemption.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.sparepart.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.account.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.user.deleteMany();

  const bagas = await prisma.user.create({
    data: { name: "Bagas", phone: "0812-3456-7890", points: 145 },
  });

  const hash = async (p: string) => hashPassword(p);

  await prisma.account.createMany({
    data: [
      { username: "admin", passwordHash: await hash("admin123"), role: "ADMIN" },
      { username: "mekanik", passwordHash: await hash("mekanik123"), role: "MECHANIC" },
      { username: "kasir", passwordHash: await hash("kasir123"), role: "KASIR" },
      { username: "bagas", passwordHash: await hash("bagas123"), role: "CUSTOMER", userId: bagas.id },
    ],
  });

  const andi = await prisma.mechanic.create({
    data: { name: "Bro Andi", shift: "15.00–21.00" },
  });

  await prisma.booking.create({
    data: {
      queueNumber: "A-12",
      ownerName: "Bagas",
      motor: "Vario 160",
      plate: "B 1234 RR",
      serviceType: "Servis Besar",
      appointmentDate: "Sel, 14 Jul",
      appointmentTime: "15:00",
      status: "Dikerjakan",
      basePrice: 250000,
      userId: bagas.id,
      mechanicId: andi.id,
      findings: {
        create: [
          {
            name: "Kampas Rem Belakang",
            note: "Tebal sisa 1mm, disarankan ganti.",
            price: 85000,
            status: "pending",
          },
          {
            name: "Oli Mesin 1L",
            note: "Sudah 2.500 km, waktunya ganti.",
            price: 70000,
            status: "pending",
          },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      queueNumber: "A-13",
      ownerName: "Siti",
      motor: "Beat",
      plate: "B 5567 ST",
      serviceType: "Servis Ringan",
      appointmentDate: "Sel, 14 Jul",
      appointmentTime: "16:00",
      status: "Menunggu",
      basePrice: 75000,
    },
  });

  await prisma.booking.create({
    data: {
      queueNumber: "A-14",
      ownerName: "Andi",
      motor: "NMAX",
      plate: "B 7781 ND",
      serviceType: "Upgrade Performa",
      appointmentDate: "Sel, 14 Jul",
      appointmentTime: "17:00",
      status: "Test Drive",
      basePrice: 500000,
      mechanicId: andi.id,
      findings: {
        create: [
          {
            name: "Rolling Speed",
            note: "Tambah rolling untuk respons gas.",
            price: 150000,
            status: "approved",
          },
        ],
      },
    },
  });

  await prisma.portfolio.createMany({
    data: [
      { title: "Vario 160 · Neon Wrap", tag: "Estetik", grad: "from-neon/40 to-electric/40" },
      { title: "NMAX · Big Bore Kit", tag: "Performa", grad: "from-magenta/40 to-electric/40" },
      { title: "Beat · LED Underglow", tag: "Estetik", grad: "from-electric/40 to-neon/40" },
      { title: "CB150R · Custom Seat", tag: "Estetik", grad: "from-neon/40 to-magenta/40" },
      { title: "Scoopy · Airbrush Anime", tag: "Cat", grad: "from-magenta/40 to-neon/40" },
      { title: "PCX · Suspensi VIP", tag: "Performa", grad: "from-electric/40 to-neon/40" },
    ],
  });

  await prisma.reward.createMany({
    data: [
      { name: "Diskon Oli 1L", cost: 50, icon: "Droplet", tag: "Diskon" },
      { name: "Stiker Eksklusif RR", cost: 30, icon: "Sticker", tag: "Merch" },
      { name: "Kaos RR Motor", cost: 120, icon: "Shirt", tag: "Merch" },
      { name: "Kopi Gratis (Area Tunggu)", cost: 20, icon: "Coffee", tag: "Fasilitas" },
      { name: "Voucher Servis Rp50.000", cost: 200, icon: "Gift", tag: "Diskon" },
      { name: "Jaket Varial Motor", cost: 350, icon: "Shirt", tag: "Merch" },
    ],
  });

  await prisma.sparepart.createMany({
    data: [
      { name: "Oli Mesin AHM 0.8L", category: "Oli & Cairan", price: 55000, stock: 25, description: "Oli mesin motor matic 4T 0.8L, cocok untuk Vario/Beat/Scoopy." },
      { name: "Oli Mesin MPX 1L", category: "Oli & Cairan", price: 65000, stock: 20, description: "Oli mesin motor bebek & sport 1L." },
      { name: "Oli Gardan AHM 150ml", category: "Oli & Cairan", price: 25000, stock: 30, description: "Oli gardan untuk motor matic." },
      { name: "Kampas Rem Depan AHM", category: "Kaki-kaki", price: 75000, stock: 15, description: "Kampas rem depan original AHM untuk Vario/Beat." },
      { name: "Kampas Rem Belakang AHM", category: "Kaki-kaki", price: 65000, stock: 12, description: "Kampas rem belakang original AHM." },
      { name: "Busi NGK CPR8EA", category: "Mesin", price: 35000, stock: 40, description: "Busi standar untuk Vario 160, PCX, NMAX." },
      { name: "Filter Udara AHM", category: "Mesin", price: 40000, stock: 18, description: "Filter udara motor matic original AHM." },
      { name: "V-Belt AHM", category: "Mesin", price: 120000, stock: 10, description: "V-Belt original untuk CVT motor matic." },
      { name: "Roller AHM 13gr", category: "Mesin", price: 45000, stock: 22, description: "Roller CVT 13gr untuk performa standar." },
      { name: "Lampu LED Depan H4", category: "Kelistrikan", price: 85000, stock: 14, description: "Lampu LED H4 6000K putih terang." },
      { name: "Lampu LED Senja T10", category: "Kelistrikan", price: 25000, stock: 35, description: "Lampu senja LED T10 kecil." },
      { name: "Aki GS GTZ5S", category: "Kelistrikan", price: 180000, stock: 8, description: "Aki kering GS untuk motor matic." },
      { name: "Spion Retro Bulat", category: "Body", price: 55000, stock: 10, description: "Spion retro bulat, cocok untuk modif klasik." },
      { name: "Handle Grip ProGrip", category: "Body", price: 65000, stock: 16, description: "Handle grip karet premium, nyaman digenggam." },
      { name: "Stiker Reflektif RR", category: "Aksesoris", price: 15000, stock: 50, description: "Stiker reflektif neon RR MOTOR." },
      { name: "Kunci Gembok Brem", category: "Aksesoris", price: 45000, stock: 12, description: "Kunci gembok rem cakram anti maling." },
      { name: "Tali Leher Masker", category: "Aksesoris", price: 10000, stock: 30, description: "Tali leher masker muka, cocok untuk daily riding." },
      { name: "Sarung Jok Custom", category: "Body", price: 90000, stock: 6, description: "Sarung jok motor anti panas." },
    ],
  });

  console.log("Seed selesai ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
