import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query(`
    SELECT 
      pm.meeting_id,
      pg.group_name,
      s.student_name,
      ma.is_present
    FROM meeting_attendance ma
    JOIN project_meeting pm ON ma.meeting_id = pm.meeting_id
    JOIN project_group pg ON pm.project_group_id = pg.project_group_id
    JOIN student s ON ma.student_id = s.student_id
  `);

  return NextResponse.json(rows);
}
