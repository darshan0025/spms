import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query(`
    SELECT 
      pg.group_name,
      s.student_name,
      pgm.is_leader
    FROM project_group_member pgm
    JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
    JOIN student s ON pgm.student_id = s.student_id
  `);
  
  return NextResponse.json(rows);
}