import KnowledgeDosen from "@/components/KnowledgeDosen";

export default function KnowledgeDosenPage() {
  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <div className="mb-6 page-header animate-fade-up">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Dosen</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data dosen Fakultas Teknik Elektro Telkom University</p>
      </div>
      <KnowledgeDosen />
    </div>
  );
}
