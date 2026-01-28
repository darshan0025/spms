"use client";

import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    ClipboardCheck
} from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const staffItems: SidebarItem[] = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/staff" },
        { icon: CheckSquare, label: "Approve Projects", href: "/dashboard/staff/projects" },
        { icon: Calendar, label: "Meetings", href: "/dashboard/staff/meetings" },
        { icon: ClipboardCheck, label: "Attendance", href: "/dashboard/staff/attendance" },
    ];

    return (
        <div className="min-h-screen bg-muted/40 dark:bg-muted/10 relative">
            <Sidebar title="SPMS Staff" items={staffItems} />
            <main className="pl-64 transition-all">
                {/* Premium Background Elements (Distinct color theme for staff) */}
                <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
                    <div className="absolute bottom-[0%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
                </div>

                <div className="container p-8 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
