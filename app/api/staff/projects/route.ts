import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query(
    "SELECT project_group_id, group_name, project_title, status FROM project_group"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { project_group_id, status } = await req.json();

  await db.query(
    "UPDATE project_group SET status=? WHERE project_group_id=?",
    [status, project_group_id]
  );

  return NextResponse.json({ message: "Project status updated" });
}
