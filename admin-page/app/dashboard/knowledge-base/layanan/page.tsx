import KnowledgeLayanan from "@/components/KnowledgeLayanan";

export default function KnowledgeLayananPage() {
  return (
    <div className="flex flex-col flex-1 p-8">
      <div className="mb-6 page-header animate-fade-up">
        <h1 className="text-2xl font-bold text-gray-800">Knowledge Layanan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data pengetahuan yang digunakan chatbot untuk menjawab pertanyaan layanan</p>
      </div>
      <KnowledgeLayanan />
    </div>
  );
}
