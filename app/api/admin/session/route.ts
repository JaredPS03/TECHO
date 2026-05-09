import pool from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("admin_session")?.value

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const [rows]: any = await pool.query(
      "SELECT id, email FROM admin_users WHERE id = ?",
      [sessionId]
    )

    const admin = rows[0]

    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, admin })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
