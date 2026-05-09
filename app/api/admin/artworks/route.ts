import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin_session")?.value
  if (!sessionId) return false
  
  const [rows]: any = await pool.query("SELECT id FROM admin_users WHERE id = ?", [sessionId])
  return rows.length > 0
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rows] = await pool.query("SELECT * FROM artworks ORDER BY created_at DESC")
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, artist, technique, dimensions, year, description, starting_price, image_url } = body

    if (!title || !artist || !technique) {
      return NextResponse.json({ error: "Title, artist, and technique are required" }, { status: 400 })
    }

    const [res]: any = await pool.query(
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

    // Return something generic since we don't have RETURNING in MySQL easily
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
