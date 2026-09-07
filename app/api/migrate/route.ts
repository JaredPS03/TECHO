import pool from "@/lib/db"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { serverError, unauthorized } from "@/lib/http"

/**
 * One-off migration: widen artworks.image_url to LONGTEXT so it can hold a
 * Base64 data URI. Idempotent, but admin-only — an unauthenticated endpoint
 * that runs DDL is an open door.
 */
export async function POST() {
  try {
    if (!(await isAdmin())) return unauthorized()

    await pool.query("ALTER TABLE artworks MODIFY COLUMN image_url LONGTEXT DEFAULT NULL")
    return NextResponse.json({ success: true, message: "Columna image_url actualizada a LONGTEXT" })
  } catch (error) {
    return serverError("migrate", error)
  }
}
