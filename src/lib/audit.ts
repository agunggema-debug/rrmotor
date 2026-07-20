// Audit logging untuk aktivitas sensitif di server.
// Mencatat ke console.error agar muncul di log Vercel / hosting.
// Untuk production, bisa di-upgrade ke database table atau service eksternal.

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE_BOOKING"
  | "UPDATE_BOOKING_STATUS"
  | "DELETE_BOOKING"
  | "CREATE_SPAREPART"
  | "UPDATE_SPAREPART"
  | "DELETE_SPAREPART"
  | "CREATE_TRANSACTION"
  | "REDEEM_POINTS"
  | "CREATE_FINDING"
  | "UPDATE_FINDING_STATUS"
  | "GOOGLE_LOGIN";

export function auditLog(
  action: AuditAction,
  detail: Record<string, unknown>,
  userId?: number | null
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId: userId ?? null,
    ...detail,
  };

  // Log ke server console (akan muncul di Vercel logs / hosting logs)
  console.log("[AUDIT]", JSON.stringify(entry));
}