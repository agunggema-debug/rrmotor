export type Role = "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER";

export const STATUS_ORDER = [
  "Menunggu",
  "Dikerjakan",
  "Test Drive",
  "Selesai",
] as const;

export type Status = (typeof STATUS_ORDER)[number];

export type Finding = {
  id: number;
  bookingId: number;
  name: string;
  note: string;
  price: number;
  photoUrl: string | null;
  status: "pending" | "approved" | "rejected";
};

export type Mechanic = {
  id: number;
  name: string;
  shift: string;
};

export type Booking = {
  id: number;
  queueNumber: string;
  ownerName: string;
  motor: string;
  plate: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  basePrice: number;
  userId: number | null;
  mechanicId: number | null;
  findings: Finding[];
  mechanic?: Mechanic | null;
};

export type Portfolio = {
  id: number;
  title: string;
  tag: string;
  grad: string;
};

export type Reward = {
  id: number;
  name: string;
  cost: number;
  icon: string;
  tag: string;
};

export type UserPoints = {
  id: number;
  name: string;
  phone: string;
  points: number;
};

export type Sparepart = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionItemInput = {
  sparepartId: number;
  quantity: number;
  priceAtSale: number;
};

export type TransactionInput = {
  customerName: string;
  customerPhone: string;
  cash: number;
  paymentMethod: string;
  note: string;
  items: TransactionItemInput[];
};

export type TransactionItem = {
  id: number;
  sparepartId: number;
  quantity: number;
  priceAtSale: number;
  sparepart: { id: number; name: string };
};

export type Transaction = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  cash: number;
  change: number;
  paymentMethod: string;
  note: string;
  createdAt: string;
  items: TransactionItem[];
};
