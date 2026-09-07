import pool from "@/lib/db"
import { NextResponse } from "next/server"
import { serverError } from "@/lib/http"

/** Public catalogue: active artworks only, newest first. */
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM artworks WHERE is_active = true ORDER BY created_at DESC"
    )
    return NextResponse.json(rows)
  } catch (error) {
    return serverError("artworks", error)
  }
}
