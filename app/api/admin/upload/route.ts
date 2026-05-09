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

    const HOSTINGER_URL = process.env.HOSTINGER_UPLOAD_URL
    const SECRET = "mi_clave_super_secreta_123"

    if (!HOSTINGER_URL) {
      throw new Error("Falta configurar HOSTINGER_UPLOAD_URL en las variables de entorno de Vercel")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = buffer.toString('base64')
    
    const fileNameString = file.name || "upload.jpg"

    const uploadRes = await fetch(HOSTINGER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: SECRET,
        fileName: fileNameString,
        fileBase64: base64String
      })
    })

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text()
      throw new Error(`Hostinger rechazó el archivo: ${errorText}`)
    }

    const data = await uploadRes.json()
    
    return NextResponse.json({ url: data.url })
  } catch (error: any) {
    console.error("Upload error:", error)
    try {
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(path.join(process.cwd(), 'UPLOAD_ERROR_LOG.txt'), String(error.stack || error.message || error));
    } catch(e){}
    return NextResponse.json({ 
      error: error.message || "Error interno al subir la imagen",
      details: String(error)
    }, { status: 500 })
  }
}
