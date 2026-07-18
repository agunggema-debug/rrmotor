"use client";

import { useState } from "react";
import useSWR from "swr";
import { Send, Sparkles, ImageIcon, MessageCircle } from "lucide-react";
import { Container, PageHeader, Card } from "@/components/ui";
import { stripHtml } from "@/lib/sanitize";
import type { Portfolio } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

const QUICK = [
  "Rekomendasi knalpot racing?",
  "Estimasi biaya wrap neon?",
  "Boleh lihat portofolio CB150R?",
];

export default function ModifPage() {
  const { data } = useSWR<Portfolio[]>("/api/portfolio", fetcher);
  const [msgs, setMsgs] = useState<{ from: "me" | "spec"; text: string }[]>([
    { from: "spec", text: "Halo! Saya Reza, Modificator Specialist RR Motor. Mau modif motor jadi apa nih? 🔧" },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          from: "spec",
          text:
            "Mantap! Untuk itu kita bisa mulai dari konsultasi estetik & performa. Booking slot Modifikasi Estetik di menu Booking ya. 🤘",
        },
      ]);
    }, 700);
  }

  return (
    <Container>
      <PageHeader
        eyebrow="F-03 · Modif Corner & Live Chat"
        title="Ruang Modifikasi Anak Motor"
        description="Konsultasi langsung dengan Modificator Specialist dan telusuri portofolio hasil modifikasi ala feed Instagram."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 neon-text" /> Portofolio Modifikasi
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(data ?? []).map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-2xl border border-line glass">
                <div className={`relative grid aspect-square place-items-center bg-gradient-to-br ${p.grad}`}>
                  <ImageIcon className="h-8 w-8 text-white/70" />
                  <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                    {stripHtml(p.tag)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{stripHtml(p.title)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <MessageCircle className="h-4 w-4 neon-text" /> Live Chat Konsultasi
          </h3>
          <Card className="flex h-[520px] flex-col p-0">
            <div className="flex items-center gap-3 border-b border-line p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full neon-border">
                <Sparkles className="h-5 w-5 neon-text" />
              </span>
              <div>
                <div className="text-sm font-semibold">Reza · Specialist</div>
                <div className="flex items-center gap-1 text-[11px] text-neon">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Online
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.from === "me"
                        ? "bg-neon text-[#04130b]"
                        : "border border-line bg-surface-2 text-light"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted hover:border-neon hover:text-neon"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-neon"
                />
                <button
                  type="submit"
                  aria-label="Kirim"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glow-btn hover:glow-btn-hover"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
