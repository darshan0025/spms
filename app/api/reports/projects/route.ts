import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query(`
    SELECT 
      pg.project_group_id,
      pg.group_name,
      pg.project_title,
      pt.project_type_name,
      pg.status
    FROM project_group pg
    JOIN project_type pt ON pg.project_type_id = pt.project_type_id
  `);

  return NextResponse.json(rows);
}
