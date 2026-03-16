import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id } = payload;
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch user from DB
        const [rows]: any = await db.query("SELECT password FROM login WHERE login_id = ?", [login_id]);
        if (rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const user = rows[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        const isPlainMatch = user.password === currentPassword; // Support legacy plain text

        if (!isMatch && !isPlainMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        await db.query("UPDATE login SET password = ? WHERE login_id = ?", [hashedPassword, login_id]);

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error: any) {
        console.error("Change Password API Error:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}
