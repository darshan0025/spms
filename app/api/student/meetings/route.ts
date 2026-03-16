import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const student_id = url.searchParams.get("student_id");

    if (!student_id) {
      return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT m.*, g.group_name, a.is_present, a.remarks as attendance_remarks
       FROM project_meeting m
       JOIN project_group g ON m.project_group_id = g.project_group_id
       JOIN project_group_member pgm ON g.project_group_id = pgm.project_group_id
       LEFT JOIN meeting_attendance a ON m.meeting_id = a.meeting_id AND a.student_id = ?
       WHERE pgm.student_id = ?
       ORDER BY m.meeting_datetime ASC`,
      [student_id, student_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching student meetings:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}
