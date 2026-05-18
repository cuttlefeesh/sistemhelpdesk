"use client";

import { useState, useEffect, useRef } from "react";
import KnowledgeModal, { KnowledgeEntry, KnowledgeFormData } from "@/components/KnowledgeModal";
import { tipeColor } from "@/lib/badgeColors";
import { getCache, setCache, invalidateCache } from "@/lib/dataCache";
import Pagination from "@/components/Pagination";

const CACHE_KEY_KNOWLEDGE = "knowledge";
const PAGE_SIZE = 50;

export default function KnowledgeLayanan() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(() => getCache<KnowledgeEntry>(CACHE_KEY_KNOWLEDGE) ?? []);
  const [loading, setLoading] = useState(() => !getCache<KnowledgeEntry>(CACHE_KEY_KNOWLEDGE));
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KnowledgeEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntry | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  const CACHE_KEY = CACHE_KEY_KNOWLEDGE;

  const fetchData = async () => {
    const cached = getCache<KnowledgeEntry>(CACHE_KEY);
    if (cached) {
      setEntries(cached);
      setLoading(false);
      setApiError(null);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/knowledge");
      if (!res.ok) throw new Error();
      const data: KnowledgeEntry[] = await res.json();
      setCache(CACHE_KEY, data);
      setEntries(data);
    } catch {
      setApiError("Tidak dapat terhubung ke database. Periksa koneksi dan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    invalidateCache(CACHE_KEY);
    await fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tipeOptions = [...new Set(entries.map((e) => e.tipe_pengguna).filter(Boolean))];

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.intent.toLowerCase().includes(search.toLowerCase()) ||
      (e.tipe_pengguna ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTipe = filterTipe ? e.tipe_pengguna === filterTipe : true;
    return matchSearch && matchTipe;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilterTipe = (v: string) => { setFilterTipe(v); setFilterOpen(false); setPage(1); };

  const handleSave = async (data: KnowledgeFormData) => {
    try {
      const res = await fetch(
        editTarget ? `/api/knowledge/${editTarget.id}` : "/api/knowledge",
        {
          method: editTarget ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setModalOpen(false);
      setEditTarget(null);
      refreshData();
      showToast("success", editTarget ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      showToast("error", `Gagal menyimpan data${msg ? `: ${msg}` : ". Coba lagi."}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/knowledge/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      refreshData();
      showToast("success", "Data berhasil dihapus.");
    } catch {
      showToast("error", "Gagal menghapus data. Coba lagi.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {toast.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {/* Error */}
      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
          <button onClick={refreshData} className="ml-auto underline text-red-600 hover:text-red-800 font-medium">Coba lagi</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8edf5] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">
            Daftar Knowledge <span className="text-gray-400 font-normal text-sm">({filtered.length} entri)</span>
          </h2>

          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filterTipe
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filter
                {filterTipe && <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>}
              </button>

              {filterOpen && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-52 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tipe Pengguna</p>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleFilterTipe("")}
                      className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${!filterTipe ? "bg-red-50 text-red-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      Semua
                    </button>
                    {tipeOptions.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleFilterTipe(t)}
                        className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${filterTipe === t ? "bg-red-50 text-red-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari intent atau tipe pengguna..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300 transition w-64"
            />

            {/* Tambah Data */}
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Data
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th-cell w-10">No</th>
                <th className="th-cell">Intent</th>
                <th className="th-cell">Tipe Pengguna</th>
                <th className="th-cell">Deskripsi</th>
                <th className="th-cell">Platform</th>
                <th className="th-cell">Diperbarui</th>
                <th className="th-cell text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-50">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
                    <td className="px-6 py-4">
                      <div className="h-3 bg-gray-100 rounded w-56 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-40" />
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg" />
                        <div className="w-7 h-7 bg-gray-100 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  {search || filterTipe ? "Tidak ada hasil yang cocok" : "Belum ada data knowledge"}
                </td></tr>
              ) : (
                paginated.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 text-gray-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{entry.intent}</td>
                    <td className="px-6 py-4">
                      {entry.tipe_pengguna
                        ? <span className={`${tipeColor(entry.tipe_pengguna)} text-xs font-medium px-2.5 py-1 rounded-full`}>{entry.tipe_pengguna}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{entry.deskripsi || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{entry.platform || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {entry.updated_at ? new Date(entry.updated_at).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditTarget(entry); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteTarget(entry)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition" title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {modalOpen && (
        <KnowledgeModal
          entry={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Hapus Knowledge?</h2>
            <p className="text-sm text-gray-500 mb-5">
              Data <strong>&quot;{deleteTarget.intent}&quot;</strong> akan dihapus secara permanen.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
