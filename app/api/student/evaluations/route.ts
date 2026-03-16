import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const student_id = url.searchParams.get("student_id");

    if (!student_id) {
      return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
    }

    // Find student's project group, then fetch all evaluations for that group
    const [rows] = await db.query(
      `SELECT e.*, s.staff_name as evaluator_name
       FROM project_evaluation e
       JOIN project_group_member pgm ON e.project_group_id = pgm.project_group_id
       LEFT JOIN staff s ON e.staff_id = s.staff_id
       WHERE pgm.student_id = ?
       ORDER BY e.evaluated_at DESC`,
      [student_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}
