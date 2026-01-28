"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/50 backdrop-blur-md dark:bg-black/50 dark:border-white/5">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>SPMS</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
