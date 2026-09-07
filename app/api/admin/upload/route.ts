import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { badRequest, serverError, unauthorized } from "@/lib/http"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) return unauthorized()

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return badRequest("No file provided")
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Formato no permitido. Usa JPG, PNG o WEBP.")
    }

    if (file.size > MAX_BYTES) {
      return badRequest("La imagen no debe pesar más de 5MB")
    }

    // Images are stored inline as Base64 data URIs in the artworks table, so
    // the app needs no object storage and no separate upload host.
    const bytes = await file.arrayBuffer()
    const base64String = Buffer.from(bytes).toString("base64")

    return NextResponse.json({ url: `data:${file.type};base64,${base64String}` })
  } catch (error) {
    return serverError("admin/upload", error)
  }
}
