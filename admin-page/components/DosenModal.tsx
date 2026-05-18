"use client";

import { useEffect, useState } from "react";

export type DosenEntry = {
  nip: string;
  nama: string;
  kode_dosen: string;
  nidn_nuptk: string;
  prodi: string;
  panggilan: string;
};

type Props = {
  entry?: DosenEntry | null;
  onClose: () => void;
  onSave: (data: DosenEntry) => void;
};

const EMPTY: DosenEntry = {
  nip: "", nama: "", kode_dosen: "", nidn_nuptk: "", prodi: "", panggilan: "",
};

const FIELDS: { key: keyof DosenEntry; label: string; required?: boolean }[] = [
  { key: "nip",       label: "NIP" },
  { key: "nama",      label: "Nama",       required: true },
  { key: "kode_dosen",label: "Kode Dosen" },
  { key: "nidn_nuptk",label: "NIDN / NUPTK" },
  { key: "prodi",     label: "Program Studi" },
  { key: "panggilan", label: "Panggilan" },
];

export default function DosenModal({ entry, onClose, onSave }: Props) {
  const [form, setForm] = useState<DosenEntry>(EMPTY);
  const [error, setError] = useState("");
  const isEdit = !!entry;

  useEffect(() => {
    setForm(entry ?? EMPTY);
    setError("");
  }, [entry]);

  const set = (key: keyof DosenEntry, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit Data Dosen" : "Tambah Dosen Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
            {FIELDS.map(({ key, label, required }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  disabled={isEdit && key === "nip"}
                  placeholder={`Masukkan ${label.toLowerCase()}...`}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            ))}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>

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
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
