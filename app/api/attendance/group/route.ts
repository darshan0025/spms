import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const meeting_id = url.searchParams.get("meeting_id");

    if (!meeting_id) {
      return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
    }

    // Get the project_group_id from the meeting
    const [meetings]: any = await db.query(
      "SELECT project_group_id FROM project_meeting WHERE meeting_id = ?",
      [meeting_id]
    );

    if (meetings.length === 0) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const project_group_id = meetings[0].project_group_id;

    // Fetch all students in that group and their attendance for this specific meeting
    const [rows] = await db.query(
      `SELECT s.student_id, s.student_name, s.email, a.is_present, a.remarks
       FROM student s
       JOIN project_group_member pgm ON s.student_id = pgm.student_id
       LEFT JOIN meeting_attendance a ON s.student_id = a.student_id AND a.meeting_id = ?
       WHERE pgm.project_group_id = ?
       ORDER BY pgm.is_leader DESC, s.student_name ASC`,
      [meeting_id, project_group_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching group attendance:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const { meeting_id, attendance_records } = await req.json();
        
        if (!meeting_id || !attendance_records || !Array.isArray(attendance_records)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // We could do a transaction here to clear existing and insert new
        // but for simplicity, let's delete existing attendance for this meeting and insert new ones
        await db.query("DELETE FROM meeting_attendance WHERE meeting_id = ?", [meeting_id]);

        if (attendance_records.length > 0) {
            for (const r of attendance_records) {
                await db.query(
                    `INSERT INTO meeting_attendance (meeting_id, student_id, is_present, remarks) 
                     VALUES (?, ?, ?, ?)
                     ON CONFLICT (meeting_id, student_id) DO UPDATE SET is_present = EXCLUDED.is_present, remarks = EXCLUDED.remarks`,
                    [meeting_id, r.student_id, !!r.is_present, r.remarks || null]
                );
            }
        }

        return NextResponse.json({ message: "Attendance saved successfully" });
    } catch (error: any) {
        console.error("Error saving attendance:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}
