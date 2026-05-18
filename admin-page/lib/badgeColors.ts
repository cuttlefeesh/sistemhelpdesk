export function tipeColor(tipe: string): string {
  const t = tipe.toLowerCase();
  if (t === "mahasiswa") return "bg-blue-100 text-blue-700";
  if (t === "dosen")     return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-600";
}

export function tipoLayananColor(tipe: string | null): string {
  if (tipe === "Referral") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
}

export function prodiColor(prodi: string): string {
  const p = prodi.toLowerCase();
  if (p === "s1 teknik elektro")         return "bg-blue-100 text-blue-700";
  if (p === "s1 teknik komputer")        return "bg-green-100 text-green-700";
  if (p === "s1 teknik telekomunikasi")  return "bg-gray-200 text-gray-600";
  if (p === "s1 teknik fisika")          return "bg-amber-100 text-amber-800";
  if (p === "s1 teknik biomedis")        return "bg-yellow-100 text-yellow-700";
  if (p === "s2 teknik elektro")         return "bg-indigo-100 text-indigo-700";
  if (p === "s3 teknik elektro")         return "bg-violet-100 text-violet-700";
  return "bg-gray-100 text-gray-600";
}
