"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginFormV2() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("NIP dan password wajib diisi.");
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
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .v2-root { font-family: 'Inter', sans-serif; }
        .v2-heading { font-family: 'Playfair Display', serif; }
        .v2-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          font-size: 14px;
          color: #ffffff;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          backdrop-filter: blur(4px);
        }
        .v2-input::placeholder { color: rgba(255,255,255,0.35); }
        .v2-input:focus {
          border-color: rgba(239,68,68,0.7);
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
        }
        .v2-input-pass { padding-right: 44px; }
        .v2-btn-submit {
          width: 100%;
          padding: 14px;
          margin-top: 4px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.95));
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(239,68,68,0.4);
          cursor: pointer;
          letter-spacing: 0.03em;
          box-shadow: 0 8px 28px rgba(185,28,28,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }
        .v2-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(248,113,113,0.95), rgba(220,38,38,1));
          box-shadow: 0 12px 36px rgba(185,28,28,0.6);
          transform: translateY(-1px);
        }
        .v2-btn-submit:active:not(:disabled) { transform: translateY(0px); }
        .v2-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .v2-icon-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .v2-icon-btn:hover { color: rgba(255,255,255,0.7); }
        @keyframes v2-fadein {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes v2-pulse-border {
          0%, 100% { box-shadow: 0 0 0 1px rgba(239,68,68,0.2), 0 32px 80px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 0 1px rgba(239,68,68,0.5), 0 32px 80px rgba(0,0,0,0.5), 0 0 40px rgba(239,68,68,0.08); }
        }
        .v2-card {
          animation: v2-fadein 0.75s cubic-bezier(0.16,1,0.3,1) both,
                     v2-pulse-border 4s ease-in-out infinite 1s;
        }
        @keyframes v2-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .v2-divider {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.08) 20%,
            rgba(239,68,68,0.4) 50%,
            rgba(255,255,255,0.08) 80%,
            transparent 100%);
          background-size: 200% auto;
          animation: v2-shimmer 3s linear infinite;
        }
      `}</style>

      {/* Full-screen background */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1 }}>
        <Image
          src="/gedung-tu.jpg"
          alt="Gedung Telkom University"
          fill
          className="object-cover"
          priority
        />
        {/* Multi-layer dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(5,0,0,0.88) 0%, rgba(30,10,5,0.78) 40%, rgba(90,12,12,0.65) 100%)",
          }}
        />
        {/* Subtle noise texture via repeating gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Page */}
      <div
        className="v2-root min-h-screen flex flex-col items-center justify-center p-4"
        style={{ position: "relative" }}
      >
        {/* Header badge */}
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "100px",
            padding: "8px 18px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.8)" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Admin Portal
          </span>
        </div>

        {/* Glassmorphism Card */}
        <div
          className="v2-card"
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "24px",
            padding: "44px 40px",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.25)) brightness(1.1)" }}>
              <Image
                src="/logo-fte.png"
                alt="FTE Telkom University"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Divider */}
          <div className="v2-divider" style={{ height: "1px", marginBottom: "24px" }} />

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              className="v2-heading"
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              Login Admin Panel
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "13px",
                marginTop: "10px",
                letterSpacing: "0.02em",
              }}
            >
              Sistem Helpdesk LAA — FTE
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* NIP */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="NIP"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="v2-input"
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="v2-input v2-input-pass"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="v2-icon-btn"
                aria-label={showPass ? "Sembunyikan" : "Tampilkan"}
              >
                {showPass ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "12px",
                }}
              >
                <svg style={{ flexShrink: 0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="v2-btn-submit">
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              marginTop: "28px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
            }}
          >
            &copy; 2025 Sistem Helpdesk LAA &mdash; Telkom University
          </p>
        </div>

        {/* Bottom decoration */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(255,255,255,0.2)",
            fontSize: "11px",
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Koneksi aman dan terenkripsi
        </div>
      </div>
    </>
  );
}
