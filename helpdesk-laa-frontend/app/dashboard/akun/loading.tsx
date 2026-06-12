export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <header className="bg-red-700 text-white px-4 py-3 flex items-center shadow-sm z-10 gap-4 shrink-0">
        <div className="w-6 h-6 shrink-0 md:hidden" />
        <div className="flex-1">
          <h2 className="text-base font-bold">Asisten Virtual LAA FTE</h2>
          <p className="text-xs opacity-80">Layanan Helpdesk</p>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 animate-pulse">
          {/* Profil banner */}
          <div className="bg-red-50 px-6 py-4 flex items-center gap-4 border-b border-gray-100 shrink-0">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>

          {/* Detail rows */}
          <div className="px-6 py-4 space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
