import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { Suspense } from "react";
import { ProjectProvider } from "@/context/ProjectContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-900" />}>
      <ProjectProvider>
        <div className="flex h-screen bg-gray-100 uppercase-sidebar-fix">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full">
             <DashboardHeader />
             <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </ProjectProvider>
    </Suspense>
  );
}


