import UserManagement from "@/components/UserManagement";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="page-header animate-fade-up">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola akun mahasiswa, dosen, dan admin.</p>
      </div>
      <UserManagement />
    </div>
  );
}
