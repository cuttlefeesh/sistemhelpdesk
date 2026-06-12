export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 gap-4 md:gap-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-800">Tiket</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar tiket dari user yang membutuhkan penanganan khusus
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Tiket", color: "bg-blue-50 text-blue-600", bar: "bg-blue-600" },
          { label: "Open", color: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
          { label: "In Progress", color: "bg-orange-50 text-orange-600", bar: "bg-orange-500" },
          { label: "Closed", color: "bg-green-50 text-green-600", bar: "bg-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#e8edf5] p-[18px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[32px] font-extrabold text-gray-900 tabular-nums leading-none">—</p>
                <p className="text-xs text-gray-400 font-medium mt-[5px]">{stat.label}</p>
              </div>
              <div className={`w-[38px] h-[38px] rounded-[10px] shrink-0 ${stat.color}`} />
            </div>
            <div className="mt-[14px] h-[3px] bg-[#f1f5f9] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${stat.bar}`} style={{ width: "0%" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">Daftar Tiket</h2>
        </div>

        <div className="overflow-x-auto rounded-b-xl ticket-table">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr>
                <th className="th-cell w-10">No</th>
                <th className="th-cell">ID</th>
                <th className="th-cell">Pengguna</th>
                <th className="th-cell">Layanan</th>
                <th className="th-cell">Subjek</th>
                <th className="th-cell">Deskripsi</th>
                <th className="th-cell">Tanggal</th>
                <th className="th-cell">Durasi</th>
                <th className="th-cell">Status</th>
                <th className="th-cell">Handled By</th>
                <th className="th-cell w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-50">
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3">
                    <div className="h-4 bg-gray-100 rounded w-32 mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3">
                    <div className="h-3 bg-gray-100 rounded w-48 mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-32" />
                  </td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-14" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-6 bg-gray-100 rounded-full w-24" /></td>
                  <td className="px-3 py-2 md:px-3 md:py-3"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                  <td className="px-3 py-4" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
