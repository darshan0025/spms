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
      "SELECT project_group_id, group_name, project_title, status FROM project_group WHERE convener_staff_id = ? OR expert_staff_id = ?",
      [staff_id, staff_id]
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { project_group_id, status } = await req.json();

  await db.query(
    "UPDATE project_group SET status=? WHERE project_group_id=?",
    [status, project_group_id]
  );

  return NextResponse.json({ message: "Project status updated" });
}
