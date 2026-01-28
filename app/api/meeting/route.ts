import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  await db.query(
    `INSERT INTO project_meeting
     (project_group_id, guide_staff_id, meeting_datetime, meeting_purpose, meeting_status)
     VALUES (?, ?, ?, ?, 'Scheduled')`,
    [
      data.project_group_id,
      data.guide_staff_id,
      data.meeting_datetime,
      data.meeting_purpose,
    ]
  );

  return NextResponse.json({ message: "Meeting Scheduled" });
}
