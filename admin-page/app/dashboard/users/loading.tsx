import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-8">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola akun mahasiswa, dosen, dan admin.</p>
      </div>
      <LoadingSpinner label="Memuat data pengguna..." />
    </div>
  );
}
