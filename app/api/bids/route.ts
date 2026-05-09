import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artwork_id, amount, bidder_name, bidder_whatsapp, bidder_email } = body

    if (!artwork_id || !amount || !bidder_name || !bidder_whatsapp || !bidder_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate inputs
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      return NextResponse.json({ error: "Invalid amount format" }, { status: 400 })
    }

    const [rows]: any = await pool.query(
      "SELECT current_bid, starting_price FROM artworks WHERE id = ?",
      [artwork_id]
    )

    const artwork = rows[0]

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    const minimumBid = Math.max(parseFloat(artwork.current_bid), parseFloat(artwork.starting_price)) + 500
    if (numAmount < minimumBid) {
      return NextResponse.json({ error: `Bid must be at least $${minimumBid}` }, { status: 400 })
    }

    // Insert the bid
    await pool.query(
      `INSERT INTO bids (id, artwork_id, amount, bidder_name, bidder_whatsapp, bidder_email)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [artwork_id, amount, bidder_name, bidder_whatsapp, bidder_email]
    )

    // Update current bid manually since we don't have a Supabase trigger
    await pool.query(
      "UPDATE artworks SET current_bid = ? WHERE id = ?",
      [amount, artwork_id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
