import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#f3f4f6]">
      <div className="sticky top-0 h-screen shrink-0 overflow-y-auto sidebar-scroll">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}
