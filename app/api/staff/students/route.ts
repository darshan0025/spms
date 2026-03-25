import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        let staffIdFromToken: number | null = null;

        if (token) {
            const payload: any = await verifyJWT(token);
            if (payload && payload.staff_id) {
                staffIdFromToken = payload.staff_id;
            } else if (payload && payload.login_id) {
                // Fallback: get staff_id from login table
                const [loginRows]: any = await db.query(
                    "SELECT staff_id FROM login WHERE login_id = ?", [payload.login_id]
                );
                if (loginRows.length > 0) {
                    staffIdFromToken = loginRows[0].staff_id;
                }
            }
        }

        const url = new URL(req.url);
        const staff_id_param = url.searchParams.get("staff_id");
        
        // Prioritize token-based ID, but use param as fallback
        const sid = staffIdFromToken || (staff_id_param ? parseInt(staff_id_param) : null);

        if (!sid || isNaN(sid)) {
            console.error("Staff Students API: Missing or invalid staff_id. Token ID:", staffIdFromToken, "Param ID:", staff_id_param);
            return NextResponse.json({ error: "Unauthorized or missing staff_id" }, { status: 400 });
        }

        console.log(`Staff Students API: Fetching for staff_id: ${sid}`);

        const [rows]: any = await db.query(`
            SELECT 
                s.student_id, 
                s.student_name, 
                s.email, 
                s.phone,
                pg.project_group_id, 
                pg.group_name, 
                pg.project_title,
                pgm.is_leader, 
                pgm.cgpa,
                l.username
            FROM student s
            JOIN project_group_member pgm ON s.student_id = pgm.student_id
            JOIN project_group pg ON pgm.project_group_id = pg.project_group_id
            LEFT JOIN login l ON s.student_id = l.student_id
            WHERE pg.guide_staff_id = ? 
               OR pg.convener_staff_id = ? 
               OR pg.expert_staff_id = ?
            ORDER BY pg.group_name, pgm.is_leader DESC, s.student_name
        `, [sid, sid, sid]);

        console.log(`Staff Students API: Found ${rows.length} students for staff_id: ${sid}`);
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Error fetching staff students:", error);
        return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
    }
}
