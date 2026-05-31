"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { UserProvider } from "@/lib/UserContext";
import HelpDeskSidebar from "@/components/HelpDeskSidebar";
import { clearAllCache } from "@/lib/dataCache";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          .then((res) => { if (res.status === 401) { clearAllCache(); window.location.replace("/"); } })
          .catch(() => {});
      }
    };

    const checkInactivity = () => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_LIMIT) {
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          clearAllCache();
          window.location.replace("/");
        });
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

  return (
    <UserProvider>
      <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
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
          {/* Mobile topbar — hamburger + judul, hanya muncul di layar kecil */}
          <header className="md:hidden bg-red-700 text-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded hover:bg-red-800 transition focus:outline-none"
              aria-label="Buka menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-base font-bold tracking-tight">Helpdesk LAA FTE</span>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
