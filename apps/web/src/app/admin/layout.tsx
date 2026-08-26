import { DashboardMobileNav, DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-riva-black">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 pb-24 lg:p-8">{children}</main>
        <DashboardMobileNav />
      </div>
    </div>
  );
}
