import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const [rows]: any = await pool.query(
      "SELECT * FROM admin_users WHERE email = ?",
      [email.toLowerCase()]
    )

    const admin = rows[0]

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set a simple session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
