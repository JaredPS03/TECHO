import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { serverError, unauthorized } from "@/lib/http"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) return unauthorized()

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
  } catch (error) {
    return serverError("admin/artworks PUT", error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) return unauthorized()

    const { id } = await params

    await pool.query("DELETE FROM artworks WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("admin/artworks DELETE", error)
  }
}
