import pool from "@/lib/db"
import { NextResponse } from "next/server"

// Run this once to upgrade image_url column to LONGTEXT for Base64 storage
export async function GET() {
  try {
    await pool.query("ALTER TABLE artworks MODIFY COLUMN image_url LONGTEXT DEFAULT NULL")
    return NextResponse.json({ success: true, message: "Columna image_url actualizada a LONGTEXT" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
