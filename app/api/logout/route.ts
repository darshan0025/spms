import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logout successful" });

    // Clear HTTP-Only Cookie
    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
        path: "/",
    });

    return response;
}