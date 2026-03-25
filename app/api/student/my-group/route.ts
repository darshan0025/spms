import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const student_id = url.searchParams.get("student_id");

        if (!student_id) {
            return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
        }

        // Fetch all groups for this student
        const [groups]: any = await db.query(`
            SELECT 
                pg.*, 
                pt.project_type_name,
                c.staff_name as convener_name,
                e.staff_name as expert_name,
                d.department_name
            FROM project_group_member pgm
            JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
            LEFT JOIN project_type pt ON pg.project_type_id = pt.project_type_id
            LEFT JOIN staff c ON pg.convener_staff_id = c.staff_id
            LEFT JOIN staff e ON pg.expert_staff_id = e.staff_id
            LEFT JOIN department d ON pg.department_id = d.department_id
            WHERE pgm.student_id = ?
        `, [student_id]);

        if (!groups || !groups.length) {
            return NextResponse.json({ groups: [] });
        }

        const groupIds = groups.map((g: any) => g.project_group_id);

        // Fetch all members of these groups
        const [allMembers]: any = await db.query(`
            SELECT 
                pgm.project_group_id,
                pgm.student_id, 
                pgm.is_leader, 
                s.student_name,
                s.email,
                s.phone
            FROM project_group_member pgm
            JOIN student s ON pgm.student_id = s.student_id
            WHERE pgm.project_group_id = ANY(?)
        `, [groupIds]);

        // Attach members to each group
        for (const group of groups) {
            group.members = allMembers.filter((m: any) => m.project_group_id === group.project_group_id);
        }

        return NextResponse.json({ groups });
    } catch (error: any) {
        console.error("Error fetching student group:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}
