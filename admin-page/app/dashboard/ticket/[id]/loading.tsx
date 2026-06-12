export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-52px)] md:h-screen overflow-hidden bg-white animate-pulse">
      {/* Skeleton header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-100" />
        <div className="w-10 h-10 rounded-full bg-gray-100" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-8 bg-gray-100 rounded-lg w-28" />
      </div>
      <div className="px-5 py-2 border-b border-gray-100 flex gap-2">
        <div className="h-3 bg-gray-100 rounded w-48" />
        <div className="h-3 bg-gray-100 rounded w-16 ml-auto" />
      </div>
      {/* Skeleton bubbles */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-4">
        {[["left", "w-64", "h-12"], ["right", "w-48", "h-10"], ["left", "w-72", "h-16"], ["right", "w-56", "h-10"]].map(([side, w, h], i) => (
          <div key={i} className={`flex items-end gap-2 ${side === "right" ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
            <div className={`${w} ${h} bg-gray-100 rounded-2xl`} />
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
