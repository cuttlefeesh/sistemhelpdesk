"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("NIP/Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login gagal. Coba lagi.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#e0e0e0_0%,#e8e8e8_70%)] flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-5 flex flex-col items-center">
          <Image
            src="/logo-fte.png"
            alt="Fakultas Teknik Elektro Telkom University"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
        </div>

        {/* Card form */}
        <div className="bg-[#d4d4d4] rounded-2xl w-80 px-8 py-7 flex flex-col items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.12),0_2px_8px_0_rgba(0,0,0,0.08)] border border-white/50">
          <p className="text-gray-700 text-base font-semibold self-start">
            Welcome, Admin!
          </p>
          <div className="w-8 h-0.5 bg-red-600 rounded-full mb-5 self-start mt-1" />

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="NIP atau Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              className="w-full bg-white rounded-lg border border-gray-300/70 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition shadow-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-white rounded-lg border border-gray-300/70 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition shadow-sm"
            />

            {error && (
              <p className="text-red-600 text-xs text-center bg-red-50/80 rounded-lg border border-red-200 px-3 py-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white text-sm font-semibold rounded-lg py-2.5 mt-1 transition-all shadow-sm shadow-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Masuk..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
