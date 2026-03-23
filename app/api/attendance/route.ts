import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { meeting_id, student_id, is_present } = await req.json();

  await db.query(
    `INSERT INTO meeting_attendance
     (meeting_id, student_id, is_present)
     VALUES (?, ?, ?) RETURNING attendance_id`,
    [meeting_id, student_id, is_present ? true : false]
  );

  return NextResponse.json({ message: "Attendance Marked" });
}
