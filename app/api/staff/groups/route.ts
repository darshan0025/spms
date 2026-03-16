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
      `SELECT g.*
       FROM project_group g
       WHERE g.convener_staff_id = ? OR g.expert_staff_id = ? OR g.guide_staff_id = ?`,
      [staff_id, staff_id, staff_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching staff groups:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}
