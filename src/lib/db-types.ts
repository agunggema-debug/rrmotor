// Database types for Supabase tables

export interface User {
  id: number;
  name: string;
  phone: string;
  points: number;
  created_at: string;
}

export interface Account {
  id: number;
  username: string;
  password_hash: string;
  role: "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER";
  user_id: number | null;
  created_at: string;
}

export interface Mechanic {
  id: number;
  name: string;
  shift: string;
}

export interface Booking {
  id: number;
  queue_number: string;
  owner_name: string;
  motor: string;
  plate: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: "Menunggu" | "Dikerjakan" | "Test Drive" | "Selesai";
  base_price: number;
  created_at: string;
  user_id: number | null;
  mechanic_id: number | null;
}

export interface Finding {
  id: number;
  booking_id: number;
  name: string;
  note: string;
  price: number;
  photo_url: string | null;
  status: "pending" | "approved" | "rejected";
}

export interface Sparepart {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  cash: number;
  change: number;
  payment_method: "cash" | "qris" | "transfer";
  note: string;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  sparepart_id: number;
  quantity: number;
  price_at_sale: number;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
  icon: string;
  tag: string;
}

export interface Redemption {
  id: number;
  user_id: number;
  reward_id: number;
  created_at: string;
}

export interface Portfolio {
  id: number;
  title: string;
  tag: string;
  grad: string;
}

export interface VisitorSession {
  id: string;
  last_seen: string;
  created_at: string;
}