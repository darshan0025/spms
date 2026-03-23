import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id, role, student_id, staff_id } = payload;

        let rows: any[];
        let groupIds: number[] = [];

        if (role === "STUDENT") {
            // Get groups student belongs to
            const [memberships]: any = await db.query("SELECT project_group_id FROM project_group_member WHERE student_id = ?", [student_id]);
            groupIds = memberships.map((m: any) => m.project_group_id);

            if (groupIds.length > 0) {
                [rows] = await db.query(
                    `SELECT d.*, 
                        COALESCE(s.student_name, st.staff_name, 'Admin') as uploader_name
                     FROM documents d
                     LEFT JOIN login l ON d.uploaded_by = l.login_id
                     LEFT JOIN student s ON l.student_id = s.student_id
                     LEFT JOIN staff st ON l.staff_id = st.staff_id
                     WHERE d.project_group_id = ANY(?) OR d.uploaded_by = ?
                     ORDER BY d.created_at DESC`,
                    [groupIds, login_id]
                ) as any;
            } else {
                // If not in any group, they only see their own uploads
                [rows] = await db.query(
                    `SELECT d.*, 
                        COALESCE(s.student_name, 'Unknown') as uploader_name
                     FROM documents d
                     LEFT JOIN login l ON d.uploaded_by = l.login_id
                     LEFT JOIN student s ON l.student_id = s.student_id
                     WHERE d.uploaded_by = ?
                     ORDER BY d.created_at DESC`,
                    [login_id]
                ) as any;
            }
        } else if (role === "STAFF") {
            // Get groups where staff is Guide, Convener, or Expert
            const [groups]: any = await db.query(
                "SELECT project_group_id FROM project_group WHERE guide_staff_id = ? OR convener_staff_id = ? OR expert_staff_id = ?",
                [staff_id, staff_id, staff_id]
            );
            groupIds = groups.map((g: any) => g.project_group_id);

            if (groupIds.length > 0) {
                [rows] = await db.query(
                    `SELECT d.*, 
                        COALESCE(s.student_name, st.staff_name, 'Admin') as uploader_name
                     FROM documents d
                     LEFT JOIN login l ON d.uploaded_by = l.login_id
                     LEFT JOIN student s ON l.student_id = s.student_id
                     LEFT JOIN staff st ON l.staff_id = st.staff_id
                     WHERE d.project_group_id = ANY(?) OR d.uploaded_by = ?
                     ORDER BY d.created_at DESC`,
                    [groupIds, login_id]
                ) as any;
            } else {
                // No groups assigned, only see own uploads
                [rows] = await db.query(
                    `SELECT d.*, 
                        COALESCE(s.student_name, st.staff_name, 'Admin') as uploader_name
                     FROM documents d
                     LEFT JOIN login l ON d.uploaded_by = l.login_id
                     LEFT JOIN student s ON l.student_id = s.student_id
                     LEFT JOIN staff st ON l.staff_id = st.staff_id
                     WHERE d.uploaded_by = ?
                     ORDER BY d.created_at DESC`,
                    [login_id]
                ) as any;
            }
        } else {
            // Admin sees all
            [rows] = await db.query(
                `SELECT d.*, 
                    COALESCE(s.student_name, st.staff_name, 'Admin') as uploader_name
                 FROM documents d
                 LEFT JOIN login l ON d.uploaded_by = l.login_id
                 LEFT JOIN student s ON l.student_id = s.student_id
                 LEFT JOIN staff st ON l.staff_id = st.staff_id
                 ORDER BY d.created_at DESC`
            ) as any;
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("Documents GET Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id, role } = payload;
        const { fileName, fileUrl, fileId, fileType, fileSize, description, project_group_id } = await req.json();

        if (!fileName || !fileUrl || !fileId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.query(
            `INSERT INTO documents (file_name, file_url, file_id, file_type, file_size, uploaded_by, uploader_role, description, project_group_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING doc_id`,
            [fileName, fileUrl, fileId, fileType || null, fileSize || null, login_id, role, description || null, project_group_id || null]
        );

        return NextResponse.json({ message: "Document saved successfully" });
    } catch (error: any) {
        console.error("Documents POST Error:", error);
        return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload: any = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

        const { login_id, role } = payload;
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("id");

        if (!docId) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

        const [rows]: any = await db.query("SELECT * FROM documents WHERE doc_id = ?", [docId]);
        if (rows.length === 0) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        const doc = rows[0];

        if (role === "Student" && doc.uploaded_by !== login_id) {
            return NextResponse.json({ error: "Not authorized to delete this document" }, { status: 403 });
        }

        // Delete from ImageKit via REST API
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (privateKey && doc.file_id) {
            try {
                const authHeader = Buffer.from(privateKey + ":").toString("base64");
                await fetch(`https://api.imagekit.io/v1/files/${doc.file_id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                    },
                });
            } catch (ikError: any) {
                console.error("ImageKit delete error:", ikError.message);
            }
        }

        await db.query("DELETE FROM documents WHERE doc_id = ?", [docId]);

        return NextResponse.json({ message: "Document deleted successfully" });
    } catch (error: any) {
        console.error("Documents DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }
}
