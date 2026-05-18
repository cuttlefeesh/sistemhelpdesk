const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const EMBED_MODEL = "nomic-embed-text";

/**
 * Generate embedding vector via Ollama.
 * Format teks mengikuti konvensi nomic-embed-text: prefix "search_document: "
 * diikuti pasangan "kolom: nilai" seperti pada auto_embedding.py.
 */
export async function generateEmbedding(fields: Record<string, string | null | undefined>): Promise<number[] | null> {
  const parts = Object.entries(fields)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}: ${v}`);

  if (parts.length === 0) return null;

  const prompt = "search_document: " + parts.join(". ");

  try {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, prompt }),
    });

    if (!res.ok) {
      console.error("[embedding] Ollama error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    return json.embedding ?? null;
  } catch (err) {
    console.error("[embedding] Gagal menghubungi Ollama:", err);
    return null;
  }
}

/** Format fields untuk user dosen — semua kolom informatif, mengikuti logika auto_embedding.py */
export function dosenFields(row: {
  nim_nip?: string | null;
  nama?: string | null;
  kode_dosen?: string | null;
  nidn_nuptk?: string | null;
  email?: string | null;
  prodi?: string | null;
}): Record<string, string | null | undefined> {
  return {
    nim_nip: row.nim_nip,
    nama: row.nama,
    kode_dosen: row.kode_dosen,
    nidn_nuptk: row.nidn_nuptk,
    email: row.email,
    prodi: row.prodi,
  };
}

/** Format fields untuk knowledge_base */
export function knowledgeFields(row: {
  intent?: string | null;
  tipe_pengguna?: string | null;
  deskripsi?: string | null;
  prosedur?: string | null;
  syarat?: string | null;
  estimasi_waktu?: string | null;
  platform?: string | null;
  pihak?: string | null;
  catatan?: string | null;
  unit_pengelola?: string | null;
  kontak_referral?: string | null;
}): Record<string, string | null | undefined> {
  return {
    intent: row.intent,
    tipe_pengguna: row.tipe_pengguna,
    deskripsi: row.deskripsi,
    prosedur: row.prosedur,
    syarat: row.syarat,
    estimasi_waktu: row.estimasi_waktu,
    platform: row.platform,
    pihak: row.pihak,
    catatan: row.catatan,
    unit_pengelola: row.unit_pengelola,
    kontak_referral: row.kontak_referral,
  };
}
