import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const [rows] = await db.query("SELECT * FROM department");
    return NextResponse.json(rows);
}

export async function POST(req: Request) {
    const { department_name } = await req.json();
    await db.query("INSERT INTO department (department_name) VALUES (?) RETURNING department_name", [department_name]);
    return NextResponse.json({ message: "Department Added" });
}

export async function PUT(req: Request) {
    const { id, department_name } = await req.json();
    await db.query("UPDATE department SET department_name = ? WHERE department_id = ?", [department_name, id]);
    return NextResponse.json({ message: "Department Updated" });
}

export async function DELETE(req: Request) {
    const { id } = await req.json();
    await db.query("DELETE FROM department WHERE department_id = ?", [id]);
    return NextResponse.json({ message: "Department Deleted" });
}
