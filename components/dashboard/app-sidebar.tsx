"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    GraduationCap,
    LayoutDashboard,
    FolderOpen,
    Users,
    Settings,
    FileBarChart,
    Layers,
    FileText,
    LifeBuoy,
    MoreHorizontal,
    Calendar,
    ClipboardList,
    Lightbulb,
    Sparkles,
    User
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";


export function AppSidebar() {
    const pathname = usePathname();

    // Extract role from pathname (e.g., /dashboard/admin -> admin)
    const roleMatch = pathname.match(/^\/dashboard\/(admin|staff|student)/);
    const role = roleMatch ? roleMatch[1] : "student";

    // Define structured navigation based on role, mimicking the given UI
    let homeLinks = [];
    let documentLinks: { href: string; label: string; icon: any }[] = [];

    if (role === "admin") {
        homeLinks = [
            { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/admin/students", label: "Student", icon: GraduationCap },
            { href: "/dashboard/admin/staff", label: "Faculty", icon: Users },
            { href: "/dashboard/admin/project-group", label: "Project Group", icon: Users },
            { href: "/dashboard/admin/academic/department", label: "Department", icon: FolderOpen },
            { href: "/dashboard/admin/project-type", label: "Project Type", icon: Layers },
            { href: "/dashboard/admin/academic/year", label: "Academic Year", icon: FileText },
        ];
        documentLinks = [
            { href: "/dashboard/admin/reports", label: "Reports", icon: FileBarChart },
        ];
    } else if (role === "staff") {
        homeLinks = [
            { href: "/dashboard/staff", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/staff/projects", label: "Projects", icon: FolderOpen },
            { href: "/dashboard/staff/students", label: "Students", icon: Users },
            { href: "/dashboard/staff/meetings", label: "Meetings", icon: Calendar },
            { href: "/dashboard/staff/attendance", label: "Attendance", icon: ClipboardList },
            { href: "/dashboard/staff/evaluations", label: "Evaluations", icon: GraduationCap },
            { href: "/dashboard/staff/documents", label: "Documents", icon: FileText },
        ];
        documentLinks = [];
    } else {
        homeLinks = [
            { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/student/my-group", label: "My Group", icon: Users },
            { href: "/dashboard/student/proposals", label: "Proposals", icon: Lightbulb },
            { href: "/dashboard/student/meetings", label: "Meetings", icon: Calendar },
            { href: "/dashboard/student/attendance", label: "Attendance", icon: ClipboardList },
            { href: "/dashboard/student/documents", label: "Documents", icon: FileText },
            { href: "/dashboard/student/evaluations", label: "Evaluations", icon: GraduationCap },
        ];
        documentLinks = [];
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <img src="/logo.png" alt="SPMS" className="size-8 rounded-lg" />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-base">SPMS</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Home Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Home</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {homeLinks.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Documents Group */}
                {documentLinks.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Documents</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {documentLinks.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
