import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id, role, student_id, staff_id } = payload;

        if (role === "ADMIN") {
            const [rows]: any = await db.query("SELECT login_id, username, role FROM login WHERE login_id = ?", [login_id]);
            if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({
                role: "ADMIN",
                name: "System Administrator",
                email: rows[0].username,
                username: rows[0].username,
                groups: [],
            });
        }

        if (role === "STAFF" && staff_id) {
            const [rows]: any = await db.query(`
                SELECT s.staff_id, s.staff_name, s.email,
                       d.department_name, l.username
                FROM staff s
                LEFT JOIN department d ON s.department_id = d.department_id
                LEFT JOIN login l ON l.staff_id = s.staff_id
                WHERE s.staff_id = ?
            `, [staff_id]);

            if (rows.length === 0) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

            const [groups]: any = await db.query(`
                SELECT pg.project_group_id, pg.group_name, pg.project_title, pg.status,
                    CASE
                        WHEN pg.guide_staff_id = ? THEN 'Guide'
                        WHEN pg.convener_staff_id = ? THEN 'Convener'
                        WHEN pg.expert_staff_id = ? THEN 'Expert'
                    END as assigned_role
                FROM project_group pg
                WHERE pg.guide_staff_id = ? OR pg.convener_staff_id = ? OR pg.expert_staff_id = ?
            `, [staff_id, staff_id, staff_id, staff_id, staff_id, staff_id]);

            return NextResponse.json({
                role: "STAFF",
                name: rows[0].staff_name,
                email: rows[0].email,
                username: rows[0].username,
                department: rows[0].department_name,
                groups,
            });
        }

        if (role === "STUDENT" && student_id) {
            const [rows]: any = await db.query(`
                SELECT s.student_id, s.student_name, s.email, s.phone,
                       d.department_name, ay.year_name as academic_year,
                       l.username
                FROM student s
                LEFT JOIN department d ON s.department_id = d.department_id
                LEFT JOIN academic_year ay ON s.academic_year_id = ay.academic_year_id
                LEFT JOIN login l ON l.student_id = s.student_id
                WHERE s.student_id = ?
            `, [student_id]);

            if (rows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });

            const [groups]: any = await db.query(`
                SELECT pg.project_group_id, pg.group_name, pg.project_title, pg.status,
                       pgm.is_leader
                FROM project_group_member pgm
                JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
                WHERE pgm.student_id = ?
            `, [student_id]);

            return NextResponse.json({
                role: "STUDENT",
                name: rows[0].student_name,
                email: rows[0].email,
                phone: rows[0].phone,
                username: rows[0].username,
                department: rows[0].department_name,
                academic_year: rows[0].academic_year,
                groups,
            });
        }

        return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    } catch (error: any) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id, role, student_id, staff_id } = payload;
        const { name, email, phone } = await req.json();

        if (role === "ADMIN") {
            await db.query("UPDATE login SET username = ? WHERE login_id = ?", [email, login_id]);
        } else if (role === "STAFF" && staff_id) {
            await db.query("UPDATE staff SET staff_name = ?, email = ? WHERE staff_id = ?", [name, email, staff_id]);
            await db.query("UPDATE login SET username = ? WHERE staff_id = ?", [email, staff_id]);
        } else if (role === "STUDENT" && student_id) {
            await db.query("UPDATE student SET student_name = ?, email = ?, phone = ? WHERE student_id = ?", [name, email, phone, student_id]);
            await db.query("UPDATE login SET username = ? WHERE student_id = ?", [email, student_id]);
        }

        // Update localStorage data on client side by returning the new data
        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error: any) {
        console.error("Profile PUT Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
