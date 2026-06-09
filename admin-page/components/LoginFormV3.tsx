"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginFormV3() {
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
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .v3-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
        }
        .v3-input {
          width: 100%;
          padding: 13px 16px 13px 16px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
        }
        .v3-input::placeholder { color: #94a3b8; }
        .v3-input:focus {
          border-color: #b91c1c;
          box-shadow: 0 0 0 3px rgba(185,28,28,0.1);
        }
        .v3-input-with-icon { padding-left: 44px; }
        .v3-input-pass { padding-right: 44px; }
        .v3-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 7px;
        }
        .v3-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 10px;
          background: #b91c1c;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(185,28,28,0.35);
          margin-top: 8px;
        }
        .v3-btn:hover:not(:disabled) {
          background: #991b1b;
          box-shadow: 0 6px 24px rgba(185,28,28,0.5);
          transform: translateY(-1px);
        }
        .v3-btn:active:not(:disabled) { transform: translateY(0); }
        .v3-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .v3-eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .v3-eye-btn:hover { color: #475569; }
        @keyframes v3-slide-in {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes v3-img-in {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .v3-left  { animation: v3-img-in  0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .v3-right { animation: v3-slide-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
      `}</style>

      <div className="v3-root">
        {/* Left: Full-height building image panel */}
        <div
          className="v3-left relative hidden lg:flex flex-col"
          style={{ width: "55%", flexShrink: 0, overflow: "hidden" }}
        >
          <Image
            src="/gedung-tu.jpg"
            alt="Gedung Telkom University"
            fill
            className="object-cover"
            priority
          />
          {/* Dark gray overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(20,20,20,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.72) 100%)",
            }}
          />
          {/* Content over image */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "48px",
            }}
          >
            {/* Top logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Image
                src="/logo-fte.png"
                alt="FTE"
                width={64}
                height={64}
                className="object-contain"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
              />
              <div>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  Fakultas Teknik Elektro
                </p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", marginTop: "2px" }}>
                  Telkom University
                </p>
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Bottom content */}
            <div>
              <div
                style={{
                  width: "48px",
                  height: "3px",
                  background: "#ef4444",
                  borderRadius: "2px",
                  marginBottom: "20px",
                }}
              />
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                  marginBottom: "10px",
                  maxWidth: "340px",
                }}
              >
                Sistem Helpdesk Akademik
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.62)",
                  fontSize: "13px",
                  lineHeight: 1.65,
                  maxWidth: "310px",
                }}
              >
                Admin Panel manajemen tiket &amp; knowledge base layanan akademik.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form panel */}
        <div
          className="v3-right flex-1 flex flex-col"
          style={{ background: "#ffffff", position: "relative" }}
        >
          {/* Top accent bar */}
          <div style={{ height: "5px", background: "linear-gradient(to right, #b91c1c, #ef4444, #b91c1c)" }} />

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 52px",
              maxWidth: "480px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Mobile logo (only visible on small screens) */}
            <div
              className="lg:hidden"
              style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}
            >
              <Image src="/logo-fte.png" alt="FTE" width={120} height={120} className="object-contain" />
            </div>

            {/* Header section */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  marginBottom: "16px",
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#b91c1c", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Akses Admin
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "10px",
                }}
              >
                Login Admin Panel
              </h1>
              <div
                style={{
                  width: "100%",
                  height: "1.5px",
                  background: "linear-gradient(to right, #b91c1c 0%, #e2e8f0 30%)",
                  borderRadius: "2px",
                }}
              />
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* NIP */}
              <div>
                <label className="v3-label">NIP</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
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
                    placeholder="Masukkan NIP Anda"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    className="v3-input v3-input-with-icon"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="v3-label">Password</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
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
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="v3-input v3-input-with-icon v3-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="v3-eye-btn"
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
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#b91c1c",
                    fontSize: "13px",
                  }}
                >
                  <svg style={{ flexShrink: 0 }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="v3-btn">
                {loading ? (
                  "Masuk..."
                ) : (
                  <>
                    Masuk ke Dashboard
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}
