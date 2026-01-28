"use client";

import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    PlusCircle,
    FileText
} from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const studentItems: SidebarItem[] = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
        { icon: PlusCircle, label: "Create Project", href: "/dashboard/student/create-project" },
        // { icon: FileText, label: "My Project", href: "/dashboard/student/my-project" }, // Future expansion
    ];

    return (
        <div className="min-h-screen bg-muted/40 dark:bg-muted/10 relative">
            <Sidebar title="SPMS Student" items={studentItems} />
            <main className="pl-64 transition-all">
                {/* Premium Background Elements (Blue/Cyan theme for students) */}
                <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
                    <div className="absolute bottom-[0%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px]" />
                </div>

                <div className="container p-8 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
