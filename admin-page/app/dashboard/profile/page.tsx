"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "Admin LAA",
    email: "admin@fte.telkomuniversity.ac.id",
    username: "admin",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleProfileSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: call API to update profile
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSave = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwords.current) {
      setPasswordError("Password saat ini wajib diisi.");
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError("Konfirmasi password tidak cocok.");
      return;
    }
    // TODO: call API to update password
    setPasswordSaved(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="mb-6 page-header animate-fade-up">
        <h1 className="text-2xl font-bold text-gray-800">Edit Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi akun admin</p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Profile banner card */}
        <div className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#1e2a3a] px-6 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 ring-2 ring-white/20 flex items-center justify-center shrink-0">
              <Image
                src="/logo-fte.png"
                alt="avatar"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-white font-semibold text-base">{form.name}</p>
              <p className="text-white/60 text-sm">{form.email}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Administrator
            </span>
            <span className="text-gray-400 text-xs">Fakultas Teknik Elektro · Telkom University</span>
          </div>
        </div>

        {/* Edit info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Informasi Akun</h2>
          </div>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>

            {profileSaved && (
              <p className="text-green-600 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Profil berhasil disimpan
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-red-600/25"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-orange-500 rounded-full shrink-0" />
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Ganti Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password Saat Ini</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                placeholder="Masukkan password saat ini..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password Baru</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                placeholder="Minimal 6 karakter..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Ulangi password baru..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            {passwordSaved && (
              <p className="text-green-600 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Password berhasil diubah
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-red-600/25"
              >
                Ganti Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
