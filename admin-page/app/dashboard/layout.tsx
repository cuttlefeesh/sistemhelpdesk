"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex bg-[#f3f4f6] min-h-screen">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <div className="md:sticky md:top-0 md:h-screen md:shrink-0 md:overflow-y-auto sidebar-scroll">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* ── Konten utama ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* ── Mobile topbar ── */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Buka menu"
            aria-expanded={sidebarOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(220,38,38,0.35)]">
              <Image
                src="/logo-fte.png"
                alt="FTE Telkom University"
                width={18}
                height={18}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-bold text-gray-800 tracking-tight">LAA Admin</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
