import { NextResponse } from "next/server"
import { getAdmin } from "@/lib/auth"
import { serverError } from "@/lib/http"

export async function GET() {
  try {
    const admin = await getAdmin()

    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, admin })
  } catch (error) {
    return serverError("admin/session", error)
  }
}
