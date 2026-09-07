import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { badRequest, notFound, serverError } from "@/lib/http"

/** Every bid must beat the current one by at least this much. */
const MIN_INCREMENT = 500

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artwork_id, amount, bidder_name, bidder_whatsapp, bidder_email } = body

    if (!artwork_id || !amount || !bidder_name || !bidder_whatsapp || !bidder_email) {
      return badRequest("Missing required fields")
    }

    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return badRequest("Invalid amount format")
    }

    // Keep values inside the column widths so a long input fails as a 400
    // instead of blowing up as a database error.
    const name = String(bidder_name).trim().slice(0, 255)
    const whatsapp = String(bidder_whatsapp).trim().slice(0, 50)
    const email = String(bidder_email).trim().slice(0, 255)

    if (!name || !whatsapp || !email) {
      return badRequest("Missing required fields")
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return badRequest("Invalid email address")
    }

    // Two people bidding at the same time could both clear the minimum against
    // the same stale `current_bid`, and the second write would silently lower
    // the price. Locking the row for the duration of the transaction makes the
    // read-check-write sequence atomic.
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [rows]: any = await connection.query(
        "SELECT current_bid, starting_price FROM artworks WHERE id = ? AND is_active = true FOR UPDATE",
        [artwork_id]
      )
      const artwork = rows[0]

      if (!artwork) {
        await connection.rollback()
        return notFound("Artwork not found")
      }

      const minimumBid =
        Math.max(Number(artwork.current_bid) || 0, Number(artwork.starting_price) || 0) + MIN_INCREMENT

      if (numAmount < minimumBid) {
        await connection.rollback()
        return badRequest(`Bid must be at least $${minimumBid}`)
      }

      await connection.query(
        `INSERT INTO bids (id, artwork_id, amount, bidder_name, bidder_whatsapp, bidder_email)
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [artwork_id, numAmount, name, whatsapp, email]
      )

      await connection.query(
        "UPDATE artworks SET current_bid = ? WHERE id = ?",
        [numAmount, artwork_id]
      )

      await connection.commit()
      return NextResponse.json({ success: true })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    return serverError("bids", error)
  }
}
