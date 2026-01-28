"use client";

import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  FolderOpen
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin" },
    { icon: FolderOpen, label: "Project Types", href: "/dashboard/admin/project-type" },
    { icon: Users, label: "Staff", href: "/dashboard/admin/staff" },
    { icon: FileText, label: "Reports", href: "/dashboard/admin/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 dark:bg-muted/10 relative">
      <Sidebar title="SPMS Admin" items={adminItems} />
      <main className="pl-64 transition-all">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute bottom-[0%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="container p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}