import { NextResponse } from "next/server"

/**
 * Standard error responses.
 *
 * Route handlers used to return `error.message` straight to the client, which
 * leaks database schema, SQL and connection details to anyone who can trigger a
 * failure. The real error goes to the server logs; the client gets a generic
 * message it can safely display.
 */

export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error)
  return NextResponse.json(
    { error: "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde." },
    { status: 500 }
  )
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 })
}
