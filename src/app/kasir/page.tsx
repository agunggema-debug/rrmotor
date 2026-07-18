"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import {
  Search,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  TrendingUp,
  User,
  Phone,
  Banknote,
  CreditCard,
  Smartphone,
  Printer,
  Check,
  Trash2,
} from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import type { Sparepart, Transaction } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
const PAYMENT_METHODS = [
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "qris", label: "QRIS", icon: Smartphone },
  { value: "transfer", label: "Transfer", icon: CreditCard },
];

export default function KasirPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<
    { sparepartId: number; name: string; price: number; quantity: number; stock: number }[]
  >([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cash, setCash] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successTransaction, setSuccessTransaction] = useState<Transaction | null>(null);

  const params = new URLSearchParams();
  if (category !== "Semua") params.set("category", category);
  if (search) params.set("search", search);

  const { data: spareparts } = useSWR<Sparepart[]>(
    `/api/sparepart?${params.toString()}`,
    fetcher
  );

  const { data: recentTransactions } = useSWR<Transaction[]>(
    "/api/transactions?limit=10",
    fetcher
  );

  const addToCart = useCallback(
    (item: Sparepart) => {
      if (item.stock <= 0) return;
      setCart((prev) => {
        const existing = prev.find((c) => c.sparepartId === item.id);
        if (existing) {
          if (existing.quantity >= item.stock) return prev;
          return prev.map((c) =>
            c.sparepartId === item.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
        return [
          ...prev,
          {
            sparepartId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            stock: item.stock,
          },
        ];
      });
    },
    []
  );

  const updateQty = useCallback(
    (sparepartId: number, delta: number) => {
      setCart((prev) =>
        prev
          .map((c) => {
            if (c.sparepartId !== sparepartId) return c;
            const newQty = c.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > c.stock) return c;
            return { ...c, quantity: newQty };
          })
          .filter(Boolean) as typeof cart
      );
    },
    []
  );

  const removeFromCart = useCallback((sparepartId: number) => {
    setCart((prev) => prev.filter((c) => c.sparepartId !== sparepartId));
  }, []);

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cashNum = Number(cash.replace(/\D/g, "")) || 0;
  const change = cashNum >= total ? cashNum - total : 0;

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          cash: cashNum,
          paymentMethod,
          note,
          items: cart.map((c) => ({
            sparepartId: c.sparepartId,
            quantity: c.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal membuat transaksi");
        return;
      }

      const txn: Transaction = await res.json();
      setSuccessTransaction(txn);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCash("");
      setPaymentMethod("cash");
      setNote("");
      mutate("/api/sparepart?");
      mutate("/api/transactions?limit=10");
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const resetSuccess = () => setSuccessTransaction(null);

  // Struk / Invoice sukses
  if (successTransaction) {
    const t = successTransaction;
    return (
      <Container>
        <div className="mx-auto max-w-md py-10">
          <Card className="text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-neon/10 mx-auto">
              <Check className="h-8 w-8 neon-text" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Transaksi Berhasil</h2>
            <p className="mt-2 text-sm text-muted">{t.invoiceNumber}</p>

            <div className="mt-6 space-y-2 border-t border-line pt-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tanggal</span>
                <span>{new Date(t.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
              </div>
              {t.customerName && (
                <div className="flex justify-between">
                  <span className="text-muted">Pelanggan</span>
                  <span>{t.customerName}</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-y border-line py-4">
              {t.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.sparepart.name} <span className="text-muted">x{item.quantity}</span>
                  </span>
                  <span>Rp {(item.priceAtSale * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="neon-text">Rp {t.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Bayar</span>
                <span>Rp {t.cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Kembali</span>
                <span className="text-neon">Rp {t.change.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Metode</span>
                <span className="capitalize">{t.paymentMethod}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={resetSuccess}
                className="flex-1 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-light hover:border-neon"
              >
                Transaksi Baru
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl glow-btn px-4 py-3 text-sm font-semibold"
              >
                <Printer className="mr-1 inline h-4 w-4" /> Cetak
              </button>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        eyebrow="KASIR · POS Sparepart"
        title="Point of Sale"
        description="Sistem kasir untuk penjualan sparepart motor. Pilih item, input pelanggan, dan selesaikan transaksi."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Sparepart List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {["Semua", "Mesin", "Body", "Kaki-kaki", "Kelistrikan", "Aksesoris", "Oli & Cairan"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    category === cat
                      ? "neon-border bg-neon/10 neon-text font-medium"
                      : "border border-line text-muted hover:text-light"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none sm:w-48"
              />
            </div>
          </div>

          {/* Grid Sparepart */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {spareparts?.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={item.stock <= 0}
                className={`glass group rounded-xl p-3 text-left transition-all hover:neon-border active:scale-[0.97] ${
                  item.stock <= 0 ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <div className="grid h-16 place-items-center rounded-lg bg-surface-2">
                  <Package className="h-7 w-7 text-muted" />
                </div>
                <p className="mt-2 text-xs font-medium leading-tight line-clamp-2">{item.name}</p>
                <p className="mt-1 text-sm font-bold neon-text">
                  Rp {item.price.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted">
                  {item.stock > 0 ? `Stok: ${item.stock}` : "Habis"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="space-y-4">
          <Card>
            <h3 className="flex items-center gap-2 font-semibold">
              <ShoppingCart className="h-4 w-4 neon-text" /> Keranjang
              {cart.length > 0 && (
                <span className="ml-auto rounded-full bg-neon/10 px-2 py-0.5 text-xs neon-text">
                  {cart.reduce((s, c) => s + c.quantity, 0)} item
                </span>
              )}
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">
                <ShoppingCart className="mx-auto h-10 w-10 opacity-30" />
                <p className="mt-2">Belum ada item</p>
                <p className="text-xs">Klik sparepart untuk menambah</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {cart.map((c) => (
                  <div
                    key={c.sparepartId}
                    className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{c.name}</p>
                      <p className="text-xs text-muted">
                        Rp {c.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(c.sparepartId, -1)}
                        className="grid h-6 w-6 place-items-center rounded border border-line text-muted hover:text-light"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(c.sparepartId, 1)}
                        disabled={c.quantity >= c.stock}
                        className="grid h-6 w-6 place-items-center rounded border border-line text-muted hover:text-light disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(c.sparepartId)}
                      className="grid h-6 w-6 place-items-center rounded text-muted hover:text-magenta"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="mt-4 border-t border-line pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="neon-text">Rp {total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 neon-text" /> Data Pelanggan
            </h4>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Nama pelanggan (opsional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="No. telepon (opsional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 neon-text" /> Pembayaran
            </h4>

            <div className="flex gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-xs transition-colors ${
                    paymentMethod === pm.value
                      ? "neon-border bg-neon/10 neon-text"
                      : "border-line text-muted hover:text-light"
                  }`}
                >
                  <pm.icon className="h-4 w-4" />
                  {pm.label}
                </button>
              ))}
            </div>

            {paymentMethod === "cash" && (
              <div className="relative mt-3">
                <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Jumlah tunai"
                  value={cash}
                  onChange={(e) => setCash(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none"
                />
              </div>
            )}

            {paymentMethod === "cash" && cashNum > 0 && total > 0 && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">Kembali</span>
                <span className="font-medium text-neon">
                  Rp {change.toLocaleString()}
                </span>
              </div>
            )}

            <div className="relative mt-3">
              <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Catatan (opsional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-light placeholder:text-muted focus:border-neon focus:outline-none"
              />
            </div>
          </Card>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || submitting}
            className="w-full rounded-xl glow-btn px-5 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Memproses..."
              : `Bayar Rp ${total.toLocaleString()}`}
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 neon-text" /> Transaksi Terbaru
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Invoice</th>
                <th className="py-2 font-medium">Pelanggan</th>
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Metode</th>
                <th className="py-2 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions?.map((t) => (
                <tr key={t.id} className="border-b border-line/60">
                  <td className="py-2.5 font-medium neon-text text-xs">{t.invoiceNumber}</td>
                  <td className="py-2.5">{t.customerName || "—"}</td>
                  <td className="py-2.5 text-muted">{t.items.length} item</td>
                  <td className="py-2.5 font-medium">Rp {t.total.toLocaleString()}</td>
                  <td className="py-2.5 capitalize">{t.paymentMethod}</td>
                  <td className="py-2.5 text-muted text-xs">
                    {new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}