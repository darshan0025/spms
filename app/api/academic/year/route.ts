import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const [rows] = await db.query("SELECT * FROM academic_year");
    return NextResponse.json(rows);
}

export async function POST(req: Request) {
    const { year_name } = await req.json();
    await db.query("INSERT INTO academic_year (year_name) VALUES (?) RETURNING academic_year_id", [year_name]);
    return NextResponse.json({ message: "Academic Year Added" });
}

export async function PUT(req: Request) {
    const { id, year_name } = await req.json();
    // Assuming 'id' in request is the PK academic_year_id
    await db.query("UPDATE academic_year SET year_name = ? WHERE academic_year_id = ?", [year_name, id]);
    return NextResponse.json({ message: "Academic Year Updated" });
}

export async function DELETE(req: Request) {
    const { id } = await req.json();
    await db.query("DELETE FROM academic_year WHERE academic_year_id = ?", [id]);
    return NextResponse.json({ message: "Academic Year Deleted" });
}
