"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/lib/UserContext";
import HelpDeskSidebar from "@/components/HelpDeskSidebar";
import { handleSessionExpired } from "@/lib/sessionUtils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const INACTIVITY_LIMIT = 60 * 60 * 1000;
  const REFRESH_INTERVAL = 5 * 60 * 1000;
  const CHECK_EVERY = 60 * 1000;
  const lastActivityRef = useRef(Date.now());
  const lastRefreshRef = useRef(Date.now());

  useEffect(() => {
    const onActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      if (now - lastRefreshRef.current > REFRESH_INTERVAL) {
        lastRefreshRef.current = now;
        fetch("/api/auth/refresh", { method: "POST" })
          .then((res) => { if (res.status === 401) handleSessionExpired(); })
          .catch(() => {});
      }
    };

    const checkInactivity = () => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_LIMIT) {
        handleSessionExpired();
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const timer = setInterval(checkInactivity, CHECK_EVERY);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const handler = () => setSidebarOpen(true);
    window.addEventListener("open-sidebar", handler);
    return () => window.removeEventListener("open-sidebar", handler);
  }, []);

  return (
    <UserProvider>
      <div className="flex h-dvh bg-gray-100 font-sans overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <Suspense>
          <HelpDeskSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </Suspense>

        {/* Konten utama */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
