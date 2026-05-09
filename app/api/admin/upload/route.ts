import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Save to public/uploads
    const uploadDir = join(process.cwd(), "public/uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${fileName}` })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      url: `https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop`,
      message: "Using placeholder due to upload error"
    })
  }
}
