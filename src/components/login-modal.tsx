"use client";

import { useState, useEffect, useRef } from "react";
import { X, LogIn, ShieldCheck } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

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

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleSuccess({ credential: tokenResponse.access_token }),
    onError: () => handleGoogleError(),
  });

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
            <button
              type="button"
              onClick={() => googleLogin()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-muted transition-all hover:border-neon hover:text-light hover:shadow-[0_0_12px_rgba(45,255,136,0.2)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}