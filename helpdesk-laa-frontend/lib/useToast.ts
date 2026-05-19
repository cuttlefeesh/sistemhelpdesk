import { useState, useRef } from "react";

export type Toast = { type: "success" | "error"; message: string } | null;

export function useToast() {
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ type, message });
    timer.current = setTimeout(() => setToast(null), 4000);
  };

  const dismissToast = () => setToast(null);

  return { toast, showToast, dismissToast };
}
