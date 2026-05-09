import pool from "@/lib/db"
import { NextResponse } from "next/server"
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

    const [rows]: any = await pool.query(`
      SELECT b.*, 
             a.id as a_id, a.title as a_title, a.artist as a_artist, a.image_url as a_image_url
      FROM bids b
      LEFT JOIN artworks a ON b.artwork_id = a.id
      ORDER BY b.created_at DESC
    `)

    const data = rows.map((row: any) => {
      const { a_id, a_title, a_artist, a_image_url, ...bidData } = row
      return {
        ...bidData,
        artwork: a_id ? {
          id: a_id,
          title: a_title,
          artist: a_artist,
          image_url: a_image_url
        } : null
      }
    })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
