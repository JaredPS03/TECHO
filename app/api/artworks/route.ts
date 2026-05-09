import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM artworks WHERE is_active = true ORDER BY created_at DESC"
    )
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
