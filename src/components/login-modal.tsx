"use client";

import { useState, useEffect, useRef } from "react";
import { X, LogIn, ShieldCheck } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

type Props = Readonly<{
  open: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<string | null>;
  onGoogleLogin: (idToken: string) => Promise<string | null>;
}>;

export default function LoginModal({ open, onClose, onLogin, onGoogleLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await onLogin(username.trim(), password.trim());
    setLoading(false);
    if (err) setError(err);
  }

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    setError("");
    const err = await onGoogleLogin(credentialResponse.credential);
    if (err) setError(err);
  }

  function handleGoogleError() {
    setError("Login Google dibatalkan atau gagal");
  }

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onKey(e: KeyboardEvent) {
      if (!dialog) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function onFocus(e: FocusEvent) {
      if (!dialog) return;
      if (dialog.contains(e.target as Node)) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }

    dialog.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);

    const firstFocusable = dialog.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    return () => {
      dialog.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open, onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!dialogRef.current?.contains(e.target as Node)) {
      onClose();
    }
  }

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm ${
        open ? "" : "hidden"
      }`}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <dialog
        aria-modal="true"
        aria-labelledby="login-modal-title"
        open={open}
        ref={dialogRef}
        className="glass neon-border relative w-full max-w-sm rounded-2xl p-6"
      >
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h3 id="login-modal-title" className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-5 w-5 neon-text" /> Login RR MOTOR
            </h3>
            <button
              type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-light"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="username" className="text-xs text-muted">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                aria-describedby="login-error"
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-neon"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs text-muted">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="login-error"
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-neon"
              />
            </div>

            {error && <p id="login-error" className="text-sm text-magenta" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold glow-btn disabled:opacity-50 hover:glow-btn-hover"
            >
              <LogIn className="h-4 w-4" /> {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[11px] text-muted">atau</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-4 flex justify-center">
            <div className={open ? "" : "hidden"}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width={320}
              />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}