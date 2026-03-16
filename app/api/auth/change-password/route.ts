import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id } = payload;
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Current and New Password required" }, { status: 400 });
        }

        // Fetch current user password hash
        const [rows]: any = await db.query("SELECT password FROM login WHERE login_id = ?", [login_id]);
        if (rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = rows[0];

        // Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Hash New Password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update DB
        await db.query("UPDATE login SET password = ? WHERE login_id = ?", [hashedNewPassword, login_id]);

        return NextResponse.json({ message: "Password updated successfully" });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
