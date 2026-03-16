import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const staff_id = url.searchParams.get("staff_id");

        if (!staff_id) {
            return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });
        }

        const [rows] = await db.query(`
            SELECT 
                s.student_id, 
                s.student_name, 
                s.email, 
                s.phone,
                pg.project_group_id, 
                pg.group_name, 
                pg.project_title,
                pgm.is_leader, 
                pgm.cgpa,
                l.username
            FROM student s
            JOIN project_group_member pgm ON s.student_id = pgm.student_id
            JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
            LEFT JOIN login l ON s.student_id = l.student_id
            WHERE pg.guide_staff_id = ? 
               OR pg.convener_staff_id = ? 
               OR pg.expert_staff_id = ?
            ORDER BY pg.group_name, pgm.is_leader DESC, s.student_name
        `, [staff_id, staff_id, staff_id]);

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Error fetching staff students:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}
