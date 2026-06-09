"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginFormV1() {
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
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .v1-root { font-family: 'DM Sans', sans-serif; }
        .v1-heading { font-family: 'Sora', sans-serif; }
        .v1-btn { font-family: 'Sora', sans-serif; }
        .v1-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }
        .v1-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.12);
          background: #fff;
        }
        .v1-input::placeholder { color: #9ca3af; }
        .v1-input-pass { padding-right: 44px; }
        .v1-btn-submit {
          width: 100%;
          padding: 14px;
          margin-top: 6px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 24px rgba(220,38,38,0.4);
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .v1-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #f87171, #dc2626);
          box-shadow: 0 12px 32px rgba(220,38,38,0.5);
          transform: translateY(-1px);
        }
        .v1-btn-submit:active:not(:disabled) { transform: translateY(0); }
        .v1-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .v1-icon-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .v1-icon-btn:hover { color: #6b7280; }
        @keyframes v1-fadein {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .v1-card { animation: v1-fadein 0.6s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div
        className="v1-root min-h-screen flex"
      >
        {/* Left: Building Image */}
        <div
          className="v1-card relative hidden md:flex"
          style={{ width: "50%", flexShrink: 0 }}
        >
            <Image
              src="/gedung-tu.jpg"
              alt="Gedung Telkom University"
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlays */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.65) 100%)",
              }}
            />
            {/* Right accent line */}
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{ width: "3px", background: "linear-gradient(to bottom, #dc2626, #7f1d1d)" }}
            />
            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0" style={{ padding: "28px" }}>
              <p
                className="v1-heading"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Sistem Helpdesk LAA
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>
                Fakultas Teknik Elektro — Telkom University
              </p>
            </div>
          </div>

        {/* Right: Form Panel */}
        <div
          className="flex-1 flex flex-col items-center justify-center"
          style={{ background: "#ffffff", padding: "52px 44px" }}
        >
            {/* Logo */}
            <div style={{ marginBottom: "24px" }}>
              <Image
                src="/logo-fte.png"
                alt="FTE Telkom University"
                width={92}
                height={92}
                className="object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <div className="w-full" style={{ marginBottom: "28px" }}>
              <h1
                className="v1-heading"
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Login Admin Panel
              </h1>
              <div
                style={{
                  marginTop: "10px",
                  width: "36px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "linear-gradient(to right, #dc2626, #ef4444)",
                }}
              />
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="w-full"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* NIP */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
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
                  className="v1-input"
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
                    color: "#9ca3af",
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
                  className="v1-input v1-input-pass"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="v1-icon-btn"
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
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
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "#dc2626",
                    fontSize: "12px",
                  }}
                >
                  <svg style={{ flexShrink: 0 }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="v1-btn-submit">
                {loading ? "Masuk..." : "Masuk"}
              </button>
            </form>

            <p
              style={{
                marginTop: "32px",
                fontSize: "11px",
                color: "#9ca3af",
                textAlign: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              &copy; 2025 Sistem Helpdesk LAA &mdash; Telkom University
            </p>
        </div>
      </div>
    </>
  );
}
