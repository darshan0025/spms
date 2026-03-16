import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Counts
    const [studentRows]: any = await db.query("SELECT COUNT(*) as count FROM student");
    const [staffRows]: any = await db.query("SELECT COUNT(*) as count FROM staff");
    const [groupRows]: any = await db.query("SELECT COUNT(*) as count FROM project_group");

    // Group status breakdown
    const [statusRows]: any = await db.query(
      "SELECT status, COUNT(*) as count FROM project_group GROUP BY status"
    );

    // Department-wise group count
    const [deptGroups]: any = await db.query(`
      SELECT d.department_name, COUNT(pg.project_group_id) as count 
      FROM department d
      LEFT JOIN project_group pg ON d.department_id = pg.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY count DESC
    `);

    // Department-wise student count
    const [deptStudents]: any = await db.query(`
      SELECT d.department_name, COUNT(s.student_id) as count 
      FROM department d
      LEFT JOIN student s ON d.department_id = s.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY count DESC
    `);

    // Recent groups
    const [recentGroups]: any = await db.query(`
      SELECT pg.project_group_id, pg.group_name, pg.project_title, pg.status, pg.project_area,
             d.department_name
      FROM project_group pg
      LEFT JOIN department d ON pg.department_id = d.department_id
      ORDER BY pg.project_group_id DESC
      LIMIT 5
    `);

    // Project type breakdown
    const [typeBreakdown]: any = await db.query(`
      SELECT pt.project_type_name, COUNT(pg.project_group_id) as count
      FROM project_type pt
      LEFT JOIN project_group pg ON pt.project_type_id = pg.project_type_id
      GROUP BY pt.project_type_id, pt.project_type_name
      ORDER BY count DESC
    `);

    const statusMap: Record<string, number> = {};
    statusRows.forEach((r: any) => { statusMap[r.status] = r.count; });

    return NextResponse.json({
      totalStudents: studentRows[0].count,
      totalStaff: staffRows[0].count,
      totalGroups: groupRows[0].count,
      statusBreakdown: statusMap,
      deptGroups,
      deptStudents,
      recentGroups,
      typeBreakdown,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
