import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    const [rows]: any = await db.query(
      "SELECT * FROM login WHERE username=?",
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }

    const user = rows[0];

    // Verify Role
    // Assuming the role passed from frontend matches the DB role string (Admin vs ADMIN etc.)
    // Let's normalize to lowercase for comparison just in case
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return NextResponse.json({ error: `You are not authorized as ${role}` }, { status: 403 });
    }

    // Compare Password (handle both hashed and plain-text legacy passwords)
    console.time("bcrypt");
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd("bcrypt");

    // Also check plain text just in case migration hasn't run yet (for smoother transition)
    const isPlainMatch = user.password === password;

    if (!isMatch && !isPlainMatch) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }

    // Create JWT Token
    console.time("jwt");
    const token = await signJWT({
      login_id: user.login_id,
      staff_id: user.staff_id,
      student_id: user.student_id,
      username: user.username,
      role: user.role
    });
    console.timeEnd("jwt");

    // Fetch name and email based on role
    let fullName = user.username;
    let email = "";

    if (user.student_id) {
      const [student]: any = await db.query("SELECT student_name, email FROM student WHERE student_id = ?", [user.student_id]);
      if (student.length > 0) {
        fullName = student[0].student_name;
        email = student[0].email;
      }
    } else if (user.staff_id) {
      const [staff]: any = await db.query("SELECT staff_name, email FROM staff WHERE staff_id = ?", [user.staff_id]);
      if (staff.length > 0) {
        fullName = staff[0].staff_name;
        email = staff[0].email;
      }
    } else if (user.role === 'ADMIN') {
        fullName = "System Admin";
        email = "admin@spms.edu"; // Default for admin since login table might not have email
    }

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        login_id: user.login_id,
        staff_id: user.staff_id,
        student_id: user.student_id,
        username: user.username,
        role: user.role,
        name: fullName,
        email: email
      }
    });

    // Set HTTP-Only Cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // Force false for localhost debugging
      sameSite: "lax", // Relax strictness for redirect compatibility
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
