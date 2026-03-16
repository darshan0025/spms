import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    if (pathname.startsWith("/dashboard")) {
        const token = request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const payload = await verifyJWT(token);

        if (!payload) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Role-Based Access Control (RBAC)
        const role = (payload.role as string).toLowerCase(); // admin, staff, student
        const currentPath = pathname.toLowerCase();

        // Admin trying to access non-admin routes
        if (role === "admin" && !currentPath.startsWith("/dashboard/admin")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Staff trying to access non-staff routes
        if (role === "staff" && !currentPath.startsWith("/dashboard/staff")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Student trying to access non-student routes
        if (role === "student" && !currentPath.startsWith("/dashboard/student")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
