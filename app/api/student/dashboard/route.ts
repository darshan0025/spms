import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id } = payload;

        // Get student_id from login
        const [loginRows]: any = await db.query(
            "SELECT student_id FROM login WHERE login_id = ?", [login_id]
        );
        if (loginRows.length === 0 || !loginRows[0].student_id) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        const studentId = loginRows[0].student_id;

        // Get student info
        const [studentRows]: any = await db.query(
            "SELECT student_name, email FROM student WHERE student_id = ?", [studentId]
        );
        const student = studentRows[0] || {};

        // Get group membership
        const [memberRows]: any = await db.query(
            `SELECT pgm.project_group_id, pgm.is_leader, pg.group_name, pg.project_title, pg.status,
                    pg.project_description, pg.project_area
             FROM project_group_member pgm
             JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
             WHERE pgm.student_id = ?`, [studentId]
        );
        const group = memberRows.length > 0 ? memberRows[0] : null;

        let members: any[] = [];
        let proposals: any[] = [];
        let meetings: any[] = [];
        let attendance: any = { total: 0, present: 0 };
        let evaluations: any[] = [];
        let guideName = null;

        if (group) {
            // Get group members
            const [memRows]: any = await db.query(
                `SELECT s.student_id, s.student_name, s.email, pgm.is_leader, pgm.cgpa
                 FROM project_group_member pgm
                 JOIN student s ON pgm.student_id = s.student_id
                 WHERE pgm.project_group_id = ?`, [group.project_group_id]
            );
            members = memRows;

            // Get proposals
            const [propRows]: any = await db.query(
                `SELECT proposal_id, proposal_title, proposal_status, submitted_at
                 FROM project_proposal
                 WHERE project_group_id = ?
                 ORDER BY submitted_at DESC`, [group.project_group_id]
            );
            proposals = propRows;

            // Get meetings
            const [meetRows]: any = await db.query(
                `SELECT pm.meeting_id, pm.meeting_datetime, pm.meeting_purpose, pm.meeting_status,
                        s.staff_name as guide_name
                 FROM project_meeting pm
                 LEFT JOIN staff s ON pm.guide_staff_id = s.staff_id
                 WHERE pm.project_group_id = ?
                 ORDER BY pm.meeting_datetime DESC`, [group.project_group_id]
            );
            meetings = meetRows;

            // Get attendance stats for this student
            const [attRows]: any = await db.query(
                `SELECT COUNT(*) as total,
                        SUM(CASE WHEN ma.is_present = 1 THEN 1 ELSE 0 END) as present
                 FROM meeting_attendance ma
                 JOIN project_meeting pm ON ma.meeting_id = pm.meeting_id
                 WHERE ma.student_id = ? AND pm.project_group_id = ?`,
                [studentId, group.project_group_id]
            );
            attendance = attRows[0] || { total: 0, present: 0 };

            // Get evaluations
            const [evalRows]: any = await db.query(
                `SELECT pe.evaluation_id, pe.marks, pe.feedback, pe.evaluated_at,
                        s.staff_name as evaluator_name
                 FROM project_evaluation pe
                 LEFT JOIN staff s ON pe.staff_id = s.staff_id
                 WHERE pe.project_group_id = ?
                 ORDER BY pe.evaluated_at DESC`, [group.project_group_id]
            );
            evaluations = evalRows;

            // Get guide name
            const [guideRows]: any = await db.query(
                `SELECT s.staff_name FROM staff s
                 JOIN project_group pg ON pg.guide_staff_id = s.staff_id
                 WHERE pg.project_group_id = ?`, [group.project_group_id]
            );
            guideName = guideRows[0]?.staff_name || null;
        }

        return NextResponse.json({
            student,
            group,
            members,
            proposals,
            meetings,
            attendance,
            evaluations,
            guideName,
        });
    } catch (error: any) {
        console.error("Student Dashboard Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
