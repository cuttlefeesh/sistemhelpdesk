export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* Header mobile */}
      <header className="md:hidden bg-red-700 text-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 shrink-0">
        <div className="w-6 h-6 shrink-0" />
        <div className="flex-1">
          <h2 className="text-base font-bold">Asisten Virtual LAA FTE</h2>
          <p className="text-xs opacity-80">Layanan Helpdesk</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Daftar Tiket</h2>
              <p className="text-sm text-gray-500 mt-1">Pantau status laporan dan pertanyaan Anda</p>
            </div>
          </div>

          {/* Tabel skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] md:text-sm text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">ID Tiket</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">NIM</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">Nama</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">Kategori</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">Subjek / Masalah</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">Tanggal Dibuat</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium">Status</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs md:text-sm">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-gray-50">
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                      <td className="px-3 py-2 md:px-6 md:py-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
                      <td className="px-3 py-4" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
