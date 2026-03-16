"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "@/components/dashboard/settings-dialog";
import { useRouter, usePathname } from "next/navigation";

export function UserNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [settingsTab, setSettingsTab] = React.useState("General");
    const [mounted, setMounted] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const roleMatch = pathname?.match(/^\/dashboard\/(admin|staff|student)/);
    const role = roleMatch ? roleMatch[1] : "student";

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    const openSettings = (tab: string) => {
        setSettingsTab(tab);
        setIsSettingsOpen(true);
    };

    if (!mounted) {
        return (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </Button>
        );
    }

    return (
        <>
            <SettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                initialTab={settingsTab}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/avatars/01.png" alt="@user" />
                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || "User Profile"}</p>
                            <p className="text-xs leading-none text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                                {user?.email || "No email available"}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${role}/profile`)}>
                            Profile
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("General")}>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        Log out
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
