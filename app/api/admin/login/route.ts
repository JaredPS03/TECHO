import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { setSessionCookie } from "@/lib/auth"
import { badRequest, serverError } from "@/lib/http"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return badRequest("Email and password required")
    }

    const [rows]: any = await pool.query(
      "SELECT id, email, password_hash FROM admin_users WHERE email = ?",
      [String(email).toLowerCase()]
    )

    const admin = rows[0]

    // Same response and roughly the same work for "no such user" and "wrong
    // password", so the endpoint does not reveal which emails are registered.
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await setSessionCookie(admin.id)

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } })
  } catch (error) {
    return serverError("admin/login", error)
  }
}
