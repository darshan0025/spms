"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, LucideIcon } from "lucide-react";

export interface SidebarItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

interface SidebarProps {
    title: string;
    items: SidebarItem[];
    logoutAction?: () => void; // Optional logout handler
}

export function Sidebar({ title, items }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        // Simple client-side clear, though usually handled by a button component logic
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-background/95 backdrop-blur-md transition-transform">
            <div className="flex h-16 items-center border-b border-border/40 px-6">
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    {title}
                </span>
            </div>
            <div className="flex flex-col gap-1 p-4">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10 hover:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
