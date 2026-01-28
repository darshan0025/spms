import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM staff");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { staff_name, email } = await req.json();

  await db.query(
    "INSERT INTO staff (staff_name, email) VALUES (?, ?)",
    [staff_name, email]
  );

  return NextResponse.json({ message: "Staff Added" });
}
