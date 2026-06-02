import { clearAllCache } from "@/lib/dataCache";

let _isHandlingExpiry = false;

export async function handleSessionExpired(): Promise<void> {
  if (_isHandlingExpiry) return;
  _isHandlingExpiry = true;
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch { /* noop */ }
  clearAllCache();
  window.location.replace("/");
}
