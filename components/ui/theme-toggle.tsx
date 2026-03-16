"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle({
    className,
    variant = "ghost",
    isCollapsed = false
}: {
    className?: string,
    variant?: "ghost" | "outline" | "default" | "secondary" | "link",
    isCollapsed?: boolean
}) {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant={variant}
            size={isCollapsed ? "icon" : "default"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={className}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            {!isCollapsed && <span className="ml-2">Toggle Theme</span>}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
