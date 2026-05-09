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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { title, artist, technique, dimensions, year, description, starting_price, image_url, is_active } = body

    await pool.query(
      `UPDATE artworks SET 
       title = ?, artist = ?, technique = ?, dimensions = ?, 
       year = ?, description = ?, starting_price = ?, 
       image_url = ?, is_active = ? 
       WHERE id = ?`,
      [title, artist, technique, dimensions, year, description, starting_price, image_url, is_active ? 1 : 0, id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await pool.query("DELETE FROM artworks WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
