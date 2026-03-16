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
      `SELECT e.*, g.group_name 
       FROM project_evaluation e
       JOIN project_group g ON e.project_group_id = g.project_group_id
       WHERE e.staff_id = ?
       ORDER BY e.evaluated_at DESC`,
      [staff_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { project_group_id, staff_id, marks, feedback } = await req.json();

    // Check if an evaluation already exists for this group by this staff
    const [existing]: any = await db.query(
      "SELECT evaluation_id FROM project_evaluation WHERE project_group_id = ? AND staff_id = ?",
      [project_group_id, staff_id]
    );

    if (existing.length > 0) {
        // Update existing
        await db.query(
            "UPDATE project_evaluation SET marks = ?, feedback = ? WHERE project_group_id = ? AND staff_id = ?",
            [marks, feedback, project_group_id, staff_id]
        );
    } else {
        // Insert new
        await db.query(
            "INSERT INTO project_evaluation (project_group_id, staff_id, marks, feedback) VALUES (?, ?, ?, ?)",
            [project_group_id, staff_id, marks, feedback]
        );
    }

    return NextResponse.json({ message: "Evaluation saved successfully" });
  } catch (error: any) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}
