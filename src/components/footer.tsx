import Link from "next/link";
import { Bike, Send, MessageCircle, Share2, type LucideIcon } from "lucide-react";
import OnlineVisitors from "@/components/online-visitors";

const SOCIAL_ICONS: { id: string; Icon: LucideIcon }[] = [
  { id: "share", Icon: Share2 },
  { id: "message", Icon: MessageCircle },
  { id: "send", Icon: Send },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg neon-border">
              <Bike className="h-5 w-5 neon-text" />
            </span>RR<span className="neon-text">MOTOR</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">Bengkel motor modern pertama untuk generasi muda. Servis transparan, booking anti-antre, dan komunitas yang seru. Zero-hassle.</p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_ICONS.map(({ id, Icon }) => (
              <span key={id} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-light">Fitur</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/booking" className="hover:text-neon">
                Smart Booking
              </Link>
            </li>
            <li>
              <Link href="/progress" className="hover:text-neon">
                Live Progress
              </Link>
            </li>
            <li>
              <Link href="/modif" className="hover:text-neon">
                Modif Corner
              </Link>
            </li>
            <li>
              <Link href="/points" className="hover:text-neon">
                RR Points
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-light">Kontak</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Jl. Wangisagara, Majalaya, Bandung Regency, West Java </li>
            <li>0857-2281-7051</li>
            <li>halo@rrmotor.id</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <span>© {new Date().getFullYear()} RR MOTOR Digital Ecosystem. All rights reserved.</span>
          <span className="hidden sm:inline" aria-hidden>·</span>
          <OnlineVisitors />
        </div>
      </div>
    </footer>
  );
}
