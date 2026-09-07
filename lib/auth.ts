import crypto from "node:crypto"
import { cookies } from "next/headers"
import pool from "@/lib/db"

/**
 * Admin session handling.
 *
 * The cookie carries `<adminId>.<expiresAt>.<hmac>`, signed with SESSION_SECRET.
 * Storing the raw admin id would let anyone who learns or guesses that id forge
 * a session, so the signature is what actually authenticates the cookie; the
 * database lookup only confirms the admin still exists.
 */

const COOKIE_NAME = "admin_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set it to a random string of at least 32 characters."
    )
  }
  return secret
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

export function createSessionToken(adminId: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `${adminId}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

/** Returns the admin id when the token is authentic and unexpired, otherwise null. */
function readSessionToken(token: string): string | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [adminId, expiresAt, signature] = parts
  const expected = sign(`${adminId}.${expiresAt}`)

  const given = Buffer.from(signature)
  const want = Buffer.from(expected)
  if (given.length !== want.length) return null
  if (!crypto.timingSafeEqual(given, want)) return null

  const expiry = Number(expiresAt)
  if (!Number.isFinite(expiry) || expiry < Date.now()) return null

  return adminId
}

export async function setSessionCookie(adminId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createSessionToken(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/** The signed-in admin, or null. Verifies the signature first, then the database. */
export async function getAdmin(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const adminId = readSessionToken(token)
  if (!adminId) return null

  const [rows]: any = await pool.query(
    "SELECT id, email FROM admin_users WHERE id = ?",
    [adminId]
  )
  return rows[0] ?? null
}

/** Guard for admin-only route handlers. */
export async function isAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null
}
