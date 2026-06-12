import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="mb-6 page-header">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Dosen</h1>
      </div>
      <LoadingSpinner label="Memuat data dosen..." />
    </div>
  );
}
