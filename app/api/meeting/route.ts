import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const staff_id = url.searchParams.get("staff_id");

    if (!staff_id) {
      return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT m.*, g.group_name
       FROM project_meeting m
       JOIN project_group g ON m.project_group_id = g.project_group_id
       WHERE g.guide_staff_id = ? OR g.convener_staff_id = ? OR g.expert_staff_id = ?
       ORDER BY m.meeting_datetime ASC`,
      [staff_id, staff_id, staff_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (error: any) {
    console.error("Error scheduling meeting:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { meeting_id, meeting_datetime, meeting_purpose, meeting_status } = data;

    if (!meeting_id) {
      return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
    }

    await db.query(
      `UPDATE project_meeting SET meeting_datetime = ?, meeting_purpose = ?, meeting_status = ? WHERE meeting_id = ?`,
      [meeting_datetime, meeting_purpose, meeting_status || 'Scheduled', meeting_id]
    );

    return NextResponse.json({ message: "Meeting Updated" });
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { meeting_id } = await req.json();

    if (!meeting_id) {
      return NextResponse.json({ error: "Missing meeting_id" }, { status: 400 });
    }

    await db.query("DELETE FROM meeting_attendance WHERE meeting_id = ?", [meeting_id]);
    await db.query("DELETE FROM project_meeting WHERE meeting_id = ?", [meeting_id]);

    return NextResponse.json({ message: "Meeting Deleted" });
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}
