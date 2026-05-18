"use client";

import { useEffect, useState } from "react";

export type KnowledgeEntry = {
  id: number;
  intent: string;
  tipe_pengguna: string;
  tipe_layanan: string | null;
  unit_pengelola: string | null;
  kontak_referral: string | null;
  deskripsi: string;
  prosedur: string;
  syarat: string;
  estimasi_waktu: string;
  platform: string;
  pihak: string;
  catatan: string;
  updated_at: string;
};

export type KnowledgeFormData = Omit<KnowledgeEntry, "id" | "updated_at" | "tipe_layanan" | "unit_pengelola" | "kontak_referral"> & {
  tipe_layanan: string;
  unit_pengelola: string;
  kontak_referral: string;
};

type Props = {
  entry?: KnowledgeEntry | null;
  onClose: () => void;
  onSave: (data: KnowledgeFormData) => void;
};

const EMPTY: KnowledgeFormData = {
  intent: "", tipe_pengguna: "", tipe_layanan: "LAA", unit_pengelola: "", kontak_referral: "",
  deskripsi: "", prosedur: "", syarat: "", estimasi_waktu: "", platform: "", pihak: "", catatan: "",
};

const TIPE_OPTIONS = ["Mahasiswa", "Dosen"];
const LAA_ONLY_KEYS: (keyof KnowledgeFormData)[] = ["prosedur", "syarat", "estimasi_waktu", "platform", "pihak", "catatan"];

type Field = { key: keyof KnowledgeFormData; label: string; required?: boolean; multiline?: boolean };

const FIELDS: Field[] = [
  { key: "intent",         label: "Intent",         required: true },
  { key: "deskripsi",      label: "Deskripsi",      multiline: true },
  { key: "prosedur",       label: "Prosedur",       multiline: true },
  { key: "syarat",         label: "Syarat",         multiline: true },
  { key: "estimasi_waktu", label: "Estimasi Waktu" },
  { key: "platform",       label: "Platform" },
  { key: "pihak",          label: "Pihak",          multiline: true },
  { key: "catatan",        label: "Catatan",        multiline: true },
];

export default function KnowledgeModal({ entry, onClose, onSave }: Props) {
  const [form, setForm] = useState<KnowledgeFormData>(EMPTY);
  const [error, setError] = useState("");
  const [layananOptions, setLayananOptions] = useState<{ id: number; nama_layanan: string; tipe_pengguna: string }[]>([]);

  useEffect(() => {
    fetch("/api/layanan-master")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLayananOptions(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (entry) {
      const { id, updated_at, ...rest } = entry;
      void id; void updated_at;
      setForm({
        ...rest,
        tipe_layanan: rest.tipe_layanan ?? "LAA",
        unit_pengelola: rest.unit_pengelola ?? "",
        kontak_referral: rest.kontak_referral ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [entry]);

  const set = (key: keyof KnowledgeFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.intent.trim()) {
      setError("Intent wajib diisi.");
      return;
    }
    if (form.tipe_layanan === "Referral" && !form.unit_pengelola.trim()) {
      setError("Unit Pengelola wajib diisi untuk tipe Referral.");
      return;
    }
    onSave(form);
  };

  const isReferral = form.tipe_layanan === "Referral";

  const filteredLayananOptions = form.tipe_pengguna
    ? layananOptions.filter((o) => o.tipe_pengguna === form.tipe_pengguna)
    : layananOptions;

  const handleTipeLayananChange = (value: string) =>
    setForm((prev) => ({ ...prev, tipe_layanan: value, intent: "" }));

  const handleTipePenggunaChange = (value: string) =>
    setForm((prev) => ({ ...prev, tipe_pengguna: value, intent: "" }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            {entry ? "Edit Knowledge" : "Tambah Knowledge Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
            {FIELDS.map(({ key, label, required, multiline }) => {
              if (LAA_ONLY_KEYS.includes(key) && isReferral) return null;

              if (key === "intent") return null;

              if (key === "deskripsi") {
                return (
                  <div key={key} className="contents">
                    {/* Tipe Layanan dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Tipe Layanan</label>
                      <select
                        value={form.tipe_layanan}
                        onChange={(e) => handleTipeLayananChange(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 transition bg-white"
                      >
                        <option value="LAA">LAA</option>
                        <option value="Referral">Referral</option>
                      </select>
                    </div>
                    {/* Tipe Pengguna dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Tipe Pengguna</label>
                      <select
                        value={form.tipe_pengguna}
                        onChange={(e) => handleTipePenggunaChange(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 transition bg-white"
                      >
                        <option value="">-- Pilih Tipe Pengguna --</option>
                        {TIPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    {/* Intent */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Intent <span className="text-red-500">*</span>
                      </label>
                      {isReferral ? (
                        <input
                          type="text"
                          value={form.intent}
                          onChange={(e) => set("intent", e.target.value)}
                          placeholder="Masukkan nama layanan referral..."
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition"
                        />
                      ) : (
                        <select
                          value={form.intent}
                          onChange={(e) => set("intent", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-300 transition bg-white"
                        >
                          <option value="">-- Pilih Layanan --</option>
                          {form.tipe_pengguna ? (
                            filteredLayananOptions.map((o) => (
                              <option key={o.id} value={o.nama_layanan}>{o.nama_layanan}</option>
                            ))
                          ) : (
                            ["Mahasiswa", "Dosen"].map((tipe) => {
                              const opts = layananOptions.filter((o) => o.tipe_pengguna === tipe);
                              return opts.length > 0 ? (
                                <optgroup key={tipe} label={`Layanan ${tipe}`}>
                                  {opts.map((o) => (
                                    <option key={o.id} value={o.nama_layanan}>{o.nama_layanan}</option>
                                  ))}
                                </optgroup>
                              ) : null;
                            })
                          )}
                        </select>
                      )}
                    </div>
                    {/* Deskripsi */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <textarea
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={`Masukkan ${label.toLowerCase()}...`}
                        rows={3}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition resize-none"
                      />
                    </div>
                    {/* Field khusus Referral */}
                    {isReferral && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Unit Pengelola <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.unit_pengelola}
                            onChange={(e) => set("unit_pengelola", e.target.value)}
                            placeholder="Contoh: Ditmawa, BAK, Kemahasiswaan..."
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">Kontak Referral</label>
                          <textarea
                            value={form.kontak_referral}
                            onChange={(e) => set("kontak_referral", e.target.value)}
                            placeholder="Contoh: Gedung Rektorat Lt. 2, atau https://ditmawa.its.ac.id"
                            rows={3}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  {multiline ? (
                    <textarea
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={`Masukkan ${label.toLowerCase()}...`}
                      rows={3}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={`Masukkan ${label.toLowerCase()}...`}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition"
                    />
                  )}
                </div>
              );
            })}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              {entry ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
