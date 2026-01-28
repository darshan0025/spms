import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const [rows]: any = await db.query(
    "SELECT * FROM login WHERE username=? AND password=?",
    [username, password]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });
  }

  return NextResponse.json(rows[0]);
}
