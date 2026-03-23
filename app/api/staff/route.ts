import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const [rows] = await db.query(`
    SELECT s.*, l.username, d.department_name 
    FROM staff s 
    LEFT JOIN login l ON s.staff_id = l.staff_id
    LEFT JOIN department d ON s.department_id = d.department_id
  `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const { staff_name, email, username, password, department_id } = await req.json();

    const [result]: any = await db.query(
      "INSERT INTO staff (staff_name, email, department_id) VALUES (?, ?, ?) RETURNING staff_id",
      [staff_name, email, department_id || null]
    );

    const newStaffId = result.insertId;

    // Auto-create login
    try {
      const loginUsername = username || email;
      const rawPassword = password || "password123";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      await db.query(
        "INSERT INTO login (username, password, role, staff_id) VALUES (?, ?, ?, ?)",
        [loginUsername, hashedPassword, "STAFF", newStaffId]
      );
    } catch (loginError) {
      console.error("Failed to create login for staff:", loginError);
      // Rollback
      await db.query("DELETE FROM staff WHERE staff_id = ?", [newStaffId]);
      throw new Error("Staff created but failed to generate login. Email might already exist.");
    }

    return NextResponse.json({ message: "Staff Added" });
  } catch (error: any) {
    console.error("Error in Staff POST:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { staff_id, staff_name, email, username, password, department_id } = await req.json();

    await db.query(
      "UPDATE staff SET staff_name = ?, email = ?, department_id = ? WHERE staff_id = ?",
      [staff_name, email, department_id || null, staff_id]
    );

    // Update login table details if provided
    if (username || password) {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
          "UPDATE login SET username = ?, password = ? WHERE staff_id = ?",
          [username || email, hashedPassword, staff_id]
        );
      } else if (username) {
        await db.query(
          "UPDATE login SET username = ? WHERE staff_id = ?",
          [username, staff_id]
        );
      }
    }

    return NextResponse.json({ message: "Staff Updated" });
  } catch (error: any) {
    console.error("Error in Staff PUT:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { staff_id } = await req.json();

    const [rows]: any = await db.query("SELECT email FROM staff WHERE staff_id = ?", [staff_id]);
    const email = rows[0]?.email;

    // Delete from login first to clear FK constraint
    // Try deleting by staff_id (if column exists) OR by username (email)
    // Using a safer approach: execute two deletes or one combined if safe.
    // Since we don't know for sure if Login has staff_id column from the schema file, 
    // but the error `CONSTRAINT login_ibfk_1 FOREIGN KEY (staff_id)` proves it DOES exist.

    await db.query("DELETE FROM login WHERE staff_id = ?", [staff_id]);

    // Just in case there are orphaned logins with that email but no linked ID (legacy data?)
    if (email) {
      await db.query("DELETE FROM login WHERE username = ?", [email]);
    }

    await db.query("DELETE FROM staff WHERE staff_id = ?", [staff_id]);
    return NextResponse.json({ message: "Staff Deleted" });
  } catch (error: any) {
    console.error("Error in Staff DELETE:", error);
    return NextResponse.json({ error: error.message || "Failed to delete staff. They might be linked to existing records." }, { status: 500 });
  }
}
