import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const student_id = url.searchParams.get("student_id");

        if (!student_id) {
            return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
        }

        const [rows] = await db.query(`
            SELECT pp.* 
            FROM project_proposal pp
            JOIN project_group_member pgm ON pp.project_group_id = pgm.project_group_id
            WHERE pgm.student_id = ?
            ORDER BY pp.submitted_at DESC
        `, [student_id]);

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Error fetching proposals:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { student_id, proposal_title, proposal_description } = await req.json();

        if (!student_id || !proposal_title || !proposal_description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find group ID for this student
        const [memberRows]: any = await db.query("SELECT project_group_id FROM project_group_member WHERE student_id = ?", [student_id]);

        if (!memberRows.length || !memberRows[0].project_group_id) {
            return NextResponse.json({ error: "You must be assigned to a project group before submitting a proposal." }, { status: 400 });
        }

        const project_group_id = memberRows[0].project_group_id;

        await db.query(
            "INSERT INTO project_proposal (project_group_id, proposal_title, proposal_description) VALUES (?, ?, ?) RETURNING proposal_id",
            [project_group_id, proposal_title, proposal_description]
        );

        return NextResponse.json({ message: "Proposal Submitted Successfully" });
    } catch (error: any) {
        console.error("Error submitting proposal:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}
