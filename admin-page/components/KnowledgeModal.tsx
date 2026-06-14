"use client";

import { useEffect, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { normalize, findSimilar } from "@/lib/similarity";

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
  existingEntries?: KnowledgeEntry[];
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
  { key: "prosedur",       label: "Prosedur",       required: true, multiline: true },
  { key: "syarat",         label: "Syarat",         multiline: true },
  { key: "estimasi_waktu", label: "Estimasi Waktu" },
  { key: "platform",       label: "Platform" },
  { key: "pihak",          label: "Pihak",          multiline: true },
  { key: "catatan",        label: "Catatan",        multiline: true },
];

export default function KnowledgeModal({ entry, onClose, onSave, existingEntries }: Props) {
  const [form, setForm] = useState<KnowledgeFormData>(EMPTY);
  const [error, setError] = useState("");
  const [layananOptions, setLayananOptions] = useState<{ id: number; nama_layanan: string; tipe_pengguna: string }[]>([]);
  const [showIntentSuggestions, setShowIntentSuggestions] = useState(false);
  const [similarMatches, setSimilarMatches] = useState<{ id: number; nama_layanan: string }[]>([]);
  const [addLayananError, setAddLayananError] = useState("");
  const [savingLayanan, setSavingLayanan] = useState(false);

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
    setShowIntentSuggestions(false);
    setSimilarMatches([]);
    setAddLayananError("");
  }, [entry]);

  const set = (key: keyof KnowledgeFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.intent.trim()) {
      setError("Intent wajib diisi.");
      return;
    }
    if (!form.tipe_pengguna) {
      setError("Tipe Pengguna wajib dipilih.");
      return;
    }
    if (!form.deskripsi.trim()) {
      setError("Deskripsi wajib diisi.");
      return;
    }
    if (!isReferral && !form.prosedur.trim()) {
      setError("Prosedur wajib diisi.");
      return;
    }
    if (form.tipe_layanan === "Referral" && !form.unit_pengelola.trim()) {
      setError("Unit Pengelola wajib diisi untuk tipe Referral.");
      return;
    }
    const isDuplicate = (existingEntries ?? []).some(e =>
      e.intent.trim().toLowerCase() === form.intent.trim().toLowerCase() &&
      e.tipe_pengguna === form.tipe_pengguna &&
      (e.tipe_layanan ?? "LAA") === form.tipe_layanan &&
      e.id !== (entry?.id ?? -1)
    );
    if (isDuplicate) {
      setError("Kombinasi layanan, tipe pengguna, dan tipe layanan ini sudah ada.");
      return;
    }
    onSave(form);
  };

  const isReferral = form.tipe_layanan === "Referral";

  const usedIntents = new Set(
    (existingEntries ?? [])
      .filter(e =>
        e.tipe_pengguna === form.tipe_pengguna &&
        (e.tipe_layanan ?? "LAA") === form.tipe_layanan &&
        e.id !== (entry?.id ?? -1)
      )
      .map(e => e.intent)
  );

  const filteredLayananOptions = form.tipe_pengguna
    ? layananOptions.filter(o =>
        o.tipe_pengguna === form.tipe_pengguna && !usedIntents.has(o.nama_layanan)
      )
    : layananOptions.filter(o => !usedIntents.has(o.nama_layanan));

  const normalizedIntent = normalize(form.intent);
  const intentSuggestions = filteredLayananOptions.filter((o) =>
    normalize(o.nama_layanan).includes(normalizedIntent)
  );
  const exactMasterMatch = layananOptions.find(
    (o) => o.tipe_pengguna === form.tipe_pengguna && normalize(o.nama_layanan) === normalizedIntent
  );
  const isNewLayanan = form.intent.trim() !== "" && !exactMasterMatch && form.tipe_pengguna !== "";
  const liveSimilar = isNewLayanan
    ? findSimilar(form.intent, layananOptions.filter((o) => o.tipe_pengguna === form.tipe_pengguna), (o) => o.nama_layanan)
    : [];

  const handleTipeLayananChange = (value: string) => {
    setForm((prev) => ({ ...prev, tipe_layanan: value, intent: "" }));
    setShowIntentSuggestions(false);
    setSimilarMatches([]);
    setAddLayananError("");
  };

  const handleTipePenggunaChange = (value: string) => {
    setForm((prev) => ({ ...prev, tipe_pengguna: value, intent: "" }));
    setShowIntentSuggestions(false);
    setSimilarMatches([]);
    setAddLayananError("");
  };

  const submitNewLayanan = async (force = false) => {
    const name = form.intent.trim();
    if (!name) {
      setAddLayananError("Nama layanan wajib diisi.");
      return;
    }
    setSavingLayanan(true);
    setAddLayananError("");
    try {
      const res = await fetch("/api/layanan-master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_layanan: name, tipe_pengguna: form.tipe_pengguna, force }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setLayananOptions((prev) => [...prev, json]);
        set("intent", json.nama_layanan);
        setShowIntentSuggestions(false);
        setSimilarMatches([]);
        return;
      }
      if (json.error === "similar_found") {
        setSimilarMatches(json.similar ?? []);
        return;
      }
      setSimilarMatches([]);
      setAddLayananError(json.error || "Gagal menambah layanan.");
    } catch {
      setSimilarMatches([]);
      setAddLayananError("Gagal menambah layanan. Coba lagi.");
    } finally {
      setSavingLayanan(false);
    }
  };

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
                      <label className="text-sm font-medium text-gray-700">Tipe Layanan <span className="text-red-500">*</span></label>
                      <CustomSelect
                        value={form.tipe_layanan}
                        onChange={handleTipeLayananChange}
                        size="sm"
                        options={[{ value: "LAA", label: "LAA" }, { value: "Referral", label: "Referral" }]}
                      />
                    </div>
                    {/* Tipe Pengguna dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Tipe Pengguna <span className="text-red-500">*</span></label>
                      <CustomSelect
                        value={form.tipe_pengguna}
                        onChange={handleTipePenggunaChange}
                        size="sm"
                        placeholder="-- Pilih Tipe Pengguna --"
                        options={[{ value: "", label: "-- Pilih Tipe Pengguna --" }, ...TIPE_OPTIONS.map((t) => ({ value: t, label: t }))]}
                      />
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
                        <>
                          <div className="relative">
                            <input
                              type="text"
                              value={form.intent}
                              onChange={(e) => {
                                set("intent", e.target.value);
                                setShowIntentSuggestions(true);
                                setSimilarMatches([]);
                                setAddLayananError("");
                              }}
                              onFocus={() => setShowIntentSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowIntentSuggestions(false), 150)}
                              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                              placeholder="Cari atau ketik nama layanan..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition"
                            />
                            {showIntentSuggestions && (
                              <div className="absolute z-50 top-full mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                                {form.tipe_pengguna ? (
                                  <>
                                    {intentSuggestions.map((o) => (
                                      <button
                                        key={o.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => { set("intent", o.nama_layanan); setShowIntentSuggestions(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition"
                                      >
                                        {o.nama_layanan}
                                      </button>
                                    ))}
                                    {isNewLayanan && (
                                      <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => submitNewLayanan(false)}
                                        disabled={savingLayanan}
                                        className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                      >
                                        {savingLayanan ? "Menyimpan..." : `+ Tambah "${form.intent.trim()}" sebagai layanan baru`}
                                      </button>
                                    )}
                                    {intentSuggestions.length === 0 && !isNewLayanan && (
                                      <p className="px-3 py-2 text-xs text-gray-400">
                                        {exactMasterMatch
                                          ? "Layanan ini sudah digunakan sebagai Intent untuk kombinasi Tipe Pengguna & Tipe Layanan ini."
                                          : "Tidak ada layanan tersedia."}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {(["Mahasiswa", "Dosen"] as const).map((tipe) => {
                                      const opts = intentSuggestions.filter((o) => o.tipe_pengguna === tipe);
                                      if (opts.length === 0) return null;
                                      return (
                                        <div key={tipe}>
                                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                            {`Layanan ${tipe}`}
                                          </div>
                                          {opts.map((o) => (
                                            <button
                                              key={o.id}
                                              type="button"
                                              onMouseDown={(e) => e.preventDefault()}
                                              onClick={() => { set("intent", o.nama_layanan); setShowIntentSuggestions(false); }}
                                              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition"
                                            >
                                              {o.nama_layanan}
                                            </button>
                                          ))}
                                        </div>
                                      );
                                    })}
                                    {intentSuggestions.length === 0 && (
                                      <p className="px-3 py-2 text-xs text-gray-400">Tidak ada layanan tersedia.</p>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {!form.tipe_pengguna && (
                            <p className="text-xs text-gray-400">Pilih Tipe Pengguna untuk menambahkan layanan baru.</p>
                          )}
                          {liveSimilar.length > 0 && similarMatches.length === 0 && (
                            <p className="text-xs text-amber-600">
                              Mirip dengan layanan yang sudah ada: {liveSimilar.map((m) => `"${m.nama_layanan}"`).join(", ")}.
                            </p>
                          )}
                          {addLayananError && <p className="text-red-500 text-xs">{addLayananError}</p>}
                          {similarMatches.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex flex-col gap-1.5">
                              <p className="text-xs text-yellow-700">
                                Ditemukan layanan dengan nama serupa: {similarMatches.map((m) => `"${m.nama_layanan}"`).join(", ")}.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => submitNewLayanan(true)}
                                  disabled={savingLayanan}
                                  className="text-xs font-medium text-yellow-700 border border-yellow-300 rounded-lg px-2.5 py-1 hover:bg-yellow-100 disabled:opacity-50 transition"
                                >
                                  Tetap Tambahkan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSimilarMatches([])}
                                  className="text-xs font-medium text-gray-500 hover:text-gray-700 transition"
                                >
                                  Ubah Nama
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Deskripsi */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
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
