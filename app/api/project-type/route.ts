import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM project_type");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { project_type_name, description } = await req.json();

  await db.query(
    "INSERT INTO project_type (project_type_name, description) VALUES (?, ?)",
    [project_type_name, description || ""]
  );

  return NextResponse.json({ message: "Project Type Added" });
}

export async function PUT(req: Request) {
  const { project_type_id, project_type_name, description } = await req.json();
  await db.query(
    "UPDATE project_type SET project_type_name = ?, description = ? WHERE project_type_id = ?",
    [project_type_name, description, project_type_id]
  );
  return NextResponse.json({ message: "Project Type Updated" });
}

export async function DELETE(req: Request) {
  const { project_type_id } = await req.json();
  await db.query("DELETE FROM project_type WHERE project_type_id = ?", [
    project_type_id,
  ]);
  return NextResponse.json({ message: "Project Type Deleted" });
}
