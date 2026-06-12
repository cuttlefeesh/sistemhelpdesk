export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-red-700 text-white p-4 sm:p-5 flex items-center shadow-sm z-10 gap-4 shrink-0">
        <div className="w-6 h-6 shrink-0 md:hidden" />
        <div className="flex-1">
          <h2 className="text-lg font-bold truncate">Asisten Virtual LAA FTE</h2>
          <p className="text-sm opacity-80 truncate">Layanan Helpdesk</p>
        </div>
      </header>

      {/* Pesan — skeleton bubbles */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 0 ? "items-end" : "items-start"} animate-pulse`}>
            <div className={`max-w-[70%] h-16 rounded-xl bg-gray-200 w-64 ${i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"}`} />
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-gray-200 bg-white flex gap-2 md:gap-3 shrink-0">
        <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="w-16 md:w-24 h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
