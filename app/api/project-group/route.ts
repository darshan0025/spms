import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get("group_id");

  if (groupId) {
    // Fetch single group with full details
    const [groups]: any = await db.query(`
      SELECT 
        pg.*, 
        pt.project_type_name,
        g.staff_name as guide_name,
        c.staff_name as convener_name,
        e.staff_name as expert_name,
        d.department_name
      FROM project_group pg
      LEFT JOIN project_type pt ON pg.project_type_id = pt.project_type_id
      LEFT JOIN staff g ON pg.guide_staff_id = g.staff_id
      LEFT JOIN staff c ON pg.convener_staff_id = c.staff_id
      LEFT JOIN staff e ON pg.expert_staff_id = e.staff_id
      LEFT JOIN department d ON pg.department_id = d.department_id
      WHERE pg.project_group_id = ?
    `, [groupId]);

    if (groups.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const group = groups[0];

    // Fetch members
    const [members]: any = await db.query(`
      SELECT pgm.*, s.student_name, s.email, s.phone 
      FROM project_group_member pgm
      LEFT JOIN student s ON pgm.student_id = s.student_id
      WHERE pgm.project_group_id = ?
    `, [groupId]);

    group.members = members;
    return NextResponse.json(group);
  }

  // Default: return all groups
  const [rows] = await db.query(`
    SELECT 
      pg.*, 
      pt.project_type_name,
      c.staff_name as convener_name,
      e.staff_name as expert_name,
      d.department_name
    FROM project_group pg
    LEFT JOIN project_type pt ON pg.project_type_id = pt.project_type_id
    LEFT JOIN staff c ON pg.convener_staff_id = c.staff_id
    LEFT JOIN staff e ON pg.expert_staff_id = e.staff_id
    LEFT JOIN department d ON pg.department_id = d.department_id
  `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      group_name,
      project_title,
      project_area,
      project_description,
      project_type_id,
      convener_staff_id,
      expert_staff_id,
      department_id,
      status,
      members
    } = await req.json();

    // === VALIDATIONS ===
    if (members && Array.isArray(members) && members.length > 0) {
      // 1. Check for duplicate student IDs
      const studentIds = members.filter((m: any) => m.student_id).map((m: any) => String(m.student_id));
      const uniqueIds = new Set(studentIds);
      if (uniqueIds.size !== studentIds.length) {
        return NextResponse.json({ error: "Duplicate student IDs found. Each student can only be added once." }, { status: 400 });
      }

      // 2. Check for multiple leaders (only one allowed)
      const leaderCount = members.filter((m: any) => m.is_leader === 1 || m.is_leader === true).length;
      if (leaderCount > 1) {
        return NextResponse.json({ error: "Only one leader is allowed per group." }, { status: 400 });
      }

      // 3. Check that all student IDs exist in the database
      for (const sid of studentIds) {
        const [sRows]: any = await connection.query(
          "SELECT student_id FROM student WHERE student_id = ?", [sid]
        );
        if (sRows.length === 0) {
          return NextResponse.json({ error: `Student ID "${sid}" does not exist.` }, { status: 400 });
        }
      }
    }

    const [result]: any = await connection.query(
      `INSERT INTO project_group 
            (group_name, project_title, project_area, project_description, project_type_id, convener_staff_id, expert_staff_id, department_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING project_group_id`,
      [
        group_name || null,
        project_title || null,
        project_area || null,
        project_description || null,
        project_type_id || null,
        convener_staff_id || null,
        expert_staff_id || null,
        department_id || null,
        status || 'PENDING'
      ]
    );

    const newGroupId = result.insertId;

    if (members && Array.isArray(members) && members.length > 0) {
      for (const member of members) {
        if (member.student_id) {
          await connection.query(
            `INSERT INTO project_group_member (project_group_id, student_id, is_leader) VALUES (?, ?, ?) RETURNING group_member_id`,
            [newGroupId, member.student_id, member.is_leader ? true : false]
          );
        }
      }
    }

    await connection.commit();
    return NextResponse.json({ message: "Project Group Created" });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error in POST Project Group:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PUT(req: Request) {
  try {
    const {
      project_group_id,
      group_name,
      project_title,
      project_area,
      project_description,
      project_type_id,
      convener_staff_id,
      expert_staff_id,
      department_id,
      status
    } = await req.json();

    await db.query(
      `UPDATE project_group SET 
                group_name = ?, 
                project_title = ?, 
                project_area = ?, 
                project_description = ?, 
                project_type_id = ?, 
                convener_staff_id = ?, 
                expert_staff_id = ?, 
                department_id = ?, 
                status = ? 
            WHERE project_group_id = ?`,
      [
        group_name || null,
        project_title || null,
        project_area || null,
        project_description || null,
        project_type_id || null,
        convener_staff_id || null,
        expert_staff_id || null,
        department_id || null,
        status || 'PENDING',
        project_group_id
      ]
    );

    return NextResponse.json({ message: "Project Group Updated" });
  } catch (error: any) {
    console.error("Error in PUT Project Group:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const connection = await db.getConnection();
  try {
    const { id } = await req.json();
    await connection.beginTransaction();

    // Delete meeting attendance records (child of project_meeting)
    await connection.query(
      `DELETE FROM meeting_attendance 
       USING project_meeting 
       WHERE meeting_attendance.meeting_id = project_meeting.meeting_id 
       AND project_meeting.project_group_id = ?`, [id]
    );

    // Delete related child records in order
    await connection.query("DELETE FROM project_meeting WHERE project_group_id = ?", [id]);
    await connection.query("DELETE FROM project_evaluation WHERE project_group_id = ?", [id]);
    await connection.query("DELETE FROM project_proposal WHERE project_group_id = ?", [id]);
    await connection.query("DELETE FROM documents WHERE project_group_id = ?", [id]);
    await connection.query("DELETE FROM project_group_member WHERE project_group_id = ?", [id]);

    // Finally delete the group itself
    await connection.query("DELETE FROM project_group WHERE project_group_id = ?", [id]);

    await connection.commit();
    return NextResponse.json({ message: "Project Group Deleted" });
  } catch (error: any) {
    await connection.rollback();
    console.error("Error in DELETE Project Group:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project group." }, { status: 500 });
  } finally {
    connection.release();
  }
}
