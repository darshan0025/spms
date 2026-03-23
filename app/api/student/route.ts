import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    const [rows] = await db.query(`
        SELECT s.*, l.username 
        FROM student s 
        LEFT JOIN login l ON s.email = l.username OR s.student_id = l.student_id
    `);
    // NOTE: Joined by email OR student_id as legacy rows might only be linked by username 
    return NextResponse.json(rows);
}

export async function POST(req: Request) {
    const connection = await db.getConnection();
    try {
        const { student_name, email, phone, department_id, academic_year_id, username, password } = await req.json();

        const loginUsername = username || email;
        if (!loginUsername) {
            return NextResponse.json({ error: "Username or Email is required for login." }, { status: 400 });
        }

        await connection.beginTransaction();

        const [result]: any = await connection.query(
            "INSERT INTO student (student_name, email, phone, department_id, academic_year_id) VALUES (?, ?, ?, ?, ?) RETURNING student_id",
            [student_name, email, phone, department_id, academic_year_id]
        );

        const newStudentId = result.insertId;

        const rawPassword = password || "password123";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        try {
            await connection.query(
                "INSERT INTO login (username, password, role, student_id) VALUES (?, ?, ?, ?)",
                [loginUsername, hashedPassword, "STUDENT", newStudentId]
            );
        } catch (loginError: any) {
            await connection.rollback();
            console.error("Failed to create login for student:", loginError);
            if (loginError.code === 'ER_DUP_ENTRY') {
                return NextResponse.json({ error: `Username or Email '${loginUsername}' is already taken.` }, { status: 400 });
            }
            return NextResponse.json({ error: "Failed to generate login credentials." }, { status: 500 });
        }

        await connection.commit();
        return NextResponse.json({ message: "Student Added Successfully" });

    } catch (error: any) {
        await connection.rollback();
        console.error("Error in Student POST:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    } finally {
        connection.release();
    }
}

export async function PUT(req: Request) {
    try {
        const { student_id, student_name, email, phone, department_id, academic_year_id, username, password } = await req.json();

        await db.query(
            "UPDATE student SET student_name = ?, email = ?, phone = ?, department_id = ?, academic_year_id = ? WHERE student_id = ?",
            [student_name, email, phone, department_id, academic_year_id, student_id]
        );

        if (username || password) {
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query(
                    "UPDATE login SET username = ?, password = ? WHERE student_id = ? OR username = ?",
                    [username || email, hashedPassword, student_id, email]
                );
            } else {
                await db.query(
                    "UPDATE login SET username = ? WHERE student_id = ? OR username = ?",
                    [username, student_id, email]
                );
            }
        }

        return NextResponse.json({ message: "Student Updated" });
    } catch (error: any) {
        console.error("Error in Student PUT:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { student_id } = await req.json();

        const [rows]: any = await db.query("SELECT email FROM student WHERE student_id = ?", [student_id]);
        const email = rows[0]?.email;

        // Try deleting from login by student_id first if the column exists in your schema
        // If not, it might throw, so we can wrap or just stick to username if we are unsure.
        // Given Staff has staff_id in Login, it's highly likely Student has student_id in Login too.
        try {
            await db.query("DELETE FROM login WHERE student_id = ?", [student_id]);
        } catch (e) {
            // Ignore error if column doesn't exist, proceed to delete by username
        }

        if (email) {
            await db.query("DELETE FROM login WHERE username = ?", [email]);
        }

        await db.query("DELETE FROM student WHERE student_id = ?", [student_id]);
        return NextResponse.json({ message: "Student Deleted" });
    } catch (error: any) {
        console.error("Error in Student DELETE:", error);
        return NextResponse.json({ error: error.message || "Failed to delete student. They might be linked to existing records." }, { status: 500 });
    }
}
