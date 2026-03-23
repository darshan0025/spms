import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const {
            student_name,
            email,
            phone_no,
            username,
            password,
            department_id,
            academic_year_id
        } = await req.json();

        // Validations
        if (!student_name || !email || !phone_no || !username || !password) {
            return NextResponse.json({ error: "Name, email, phone number, username, and password are required." }, { status: 400 });
        }

        // Check if username already exists
        const [existingUser]: any = await db.query(
            "SELECT login_id FROM login WHERE username = ?", [username]
        );
        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Username already taken. Please choose another." }, { status: 400 });
        }

        // Check if email already exists in student table
        const [existingEmail]: any = await db.query(
            "SELECT student_id FROM student WHERE email = ?", [email]
        );
        if (existingEmail.length > 0) {
            return NextResponse.json({ error: "Email already registered." }, { status: 400 });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert into student table
            const [result]: any = await connection.query(
            "INSERT INTO student (student_name, email, phone, department_id, academic_year_id) VALUES (?, ?, ?, ?, ?) RETURNING student_id",
            [student_name, email, phone_no, department_id, academic_year_id]
            );
            const studentId = result.insertId;

            // 2. Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Insert into login table
            await connection.query(
                `INSERT INTO login (username, password, role, student_id) 
                 VALUES (?, ?, 'Student', ?)`,
                [username, hashedPassword, studentId]
            );

            await connection.commit();

            return NextResponse.json({ message: "Registration successful! You can now sign in." });
        } catch (err: any) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 });
    }
}
