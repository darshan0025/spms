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

        // Get staff_id from login
        const [loginRows]: any = await db.query(
            "SELECT staff_id FROM login WHERE login_id = ?", [login_id]
        );
        if (loginRows.length === 0 || !loginRows[0].staff_id) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }
        const staffId = loginRows[0].staff_id;

        // Get staff info
        const [staffRows]: any = await db.query(
            "SELECT staff_name, email FROM staff WHERE staff_id = ?", [staffId]
        );
        const staff = staffRows[0] || {};

        // Get assigned groups (as guide, convener, or expert)
        const [groupRows]: any = await db.query(
            `SELECT pg.*, 
                    CASE 
                        WHEN pg.guide_staff_id = ? THEN 'Guide'
                        WHEN pg.convener_staff_id = ? THEN 'Convener'
                        WHEN pg.expert_staff_id = ? THEN 'Expert'
                    END as staff_role
             FROM project_group pg
             WHERE pg.guide_staff_id = ? OR pg.convener_staff_id = ? OR pg.expert_staff_id = ?
             ORDER BY pg.created_at DESC`,
            [staffId, staffId, staffId, staffId, staffId, staffId]
        );

        // Get all members for assigned groups
        const groupIds = groupRows.map((g: any) => g.project_group_id);
        let allMembers: any[] = [];
        if (groupIds.length > 0) {
            const placeholders = groupIds.map(() => '?').join(',');
            const [memRows]: any = await db.query(
                `SELECT pgm.project_group_id, s.student_id, s.student_name, s.email, pgm.is_leader, pgm.cgpa
                 FROM project_group_member pgm
                 JOIN student s ON pgm.student_id = s.student_id
                 WHERE pgm.project_group_id IN (${placeholders})`, groupIds
            );
            allMembers = memRows;
        }

        // Get upcoming meetings
        const [meetingRows]: any = await db.query(
            `SELECT pm.*, pg.group_name
             FROM project_meeting pm
             JOIN project_group pg ON pm.project_group_id = pg.project_group_id
             WHERE pm.guide_staff_id = ?
             ORDER BY pm.meeting_datetime DESC
             LIMIT 10`, [staffId]
        );

        // Get pending proposals
        const [proposalRows]: any = await db.query(
            `SELECT pp.*, pg.group_name
             FROM project_proposal pp
             JOIN project_group pg ON pp.project_group_id = pg.project_group_id
             WHERE pg.guide_staff_id = ? OR pg.convener_staff_id = ? OR pg.expert_staff_id = ?
             ORDER BY pp.submitted_at DESC`,
            [staffId, staffId, staffId]
        );

        // Get evaluations given
        const [evalRows]: any = await db.query(
            `SELECT pe.*, pg.group_name
             FROM project_evaluation pe
             JOIN project_group pg ON pe.project_group_id = pg.project_group_id
             WHERE pe.staff_id = ?
             ORDER BY pe.evaluated_at DESC`, [staffId]
        );

        // Counts
        const totalStudents = allMembers.length;
        const pendingProposals = proposalRows.filter((p: any) => p.proposal_status === 'Pending').length;
        const upcomingMeetings = meetingRows.filter((m: any) => new Date(m.meeting_datetime) >= new Date()).length;

        return NextResponse.json({
            staff,
            groups: groupRows,
            members: allMembers,
            meetings: meetingRows,
            proposals: proposalRows,
            evaluations: evalRows,
            stats: {
                totalGroups: groupRows.length,
                totalStudents,
                pendingProposals,
                upcomingMeetings,
            }
        });
    } catch (error: any) {
        console.error("Staff Dashboard Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
