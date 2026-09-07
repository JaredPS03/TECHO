import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { badRequest, serverError, unauthorized } from "@/lib/http"

export async function GET() {
  try {
    if (!(await isAdmin())) return unauthorized()

    const [rows] = await pool.query("SELECT * FROM artworks ORDER BY created_at DESC")
    return NextResponse.json(rows)
  } catch (error) {
    return serverError("admin/artworks GET", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) return unauthorized()

    const body = await request.json()
    const { title, artist, technique, dimensions, year, description, starting_price, image_url } = body

    if (!title || !artist || !technique) {
      return badRequest("Title, artist, and technique are required")
    }

    await pool.query(
      `INSERT INTO artworks
       (id, title, artist, technique, dimensions, year, description, starting_price, current_bid, image_url, is_active)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0, ?, true)`,
      [
        title,
        artist,
        technique,
        dimensions || null,
        year || null,
        description || null,
        starting_price || 0,
        image_url || null
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("admin/artworks POST", error)
  }
}
