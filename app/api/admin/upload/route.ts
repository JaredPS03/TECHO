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

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG o WEBP." }, { status: 400 })
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe pesar más de 5MB" }, { status: 400 })
    }

    // Convert to Base64 Data URI and return it directly
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = buffer.toString("base64")
    const dataUri = `data:${file.type};base64,${base64String}`

    return NextResponse.json({ url: dataUri })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: error.message || "Error interno al subir la imagen"
    }, { status: 500 })
  }
}
