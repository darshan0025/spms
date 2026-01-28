import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  // 1️⃣ Insert Project Group
  const [result]: any = await db.query(
    `INSERT INTO project_group
     (group_name, project_title, project_area, project_description, project_type_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.group_name,
      data.project_title,
      data.project_area,
      data.project_description,
      data.project_type_id,
    ]
  );

  const projectGroupId = result.insertId;

  // 2️⃣ Insert Group Members
  for (const member of data.members) {
    await db.query(
      `INSERT INTO project_group_member
       (project_group_id, student_id, is_leader)
       VALUES (?, ?, ?)`,
      [projectGroupId, member.student_id, member.is_leader]
    );
  }

  return NextResponse.json({ message: "Project Group Created" });
}
