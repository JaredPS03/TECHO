export interface Artwork {
  id: string
  title: string
  artist: string
  technique: string
  dimensions: string | null
  year: string | null
  description: string | null
  starting_price: number
  current_bid: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  artwork_id: string
  amount: number
  bidder_name: string
  bidder_whatsapp: string
  bidder_email: string
  created_at: string
  artwork?: Artwork
}

/** Contact details a bidder submits with a bid. The auction is contact-only:
 *  no payment is processed, the organizers reach out to the winner. */
export interface BidderInfo {
  fullName: string
  whatsapp: string
  email: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}

// For frontend display compatibility
export interface ArtworkDisplay {
  id: string
  title: string
  artist: string
  technique: string
  dimensions: string | null
  year: string | null
  description: string | null
  currentBid: number
  imageUrl: string
}

export function toArtworkDisplay(artwork: Artwork): ArtworkDisplay {
  return {
    id: artwork.id,
    title: artwork.title,
    artist: artwork.artist,
    technique: artwork.technique,
    dimensions: artwork.dimensions || null,
    year: artwork.year || null,
    description: artwork.description,
    currentBid: Math.max(Number(artwork.current_bid) || 0, Number(artwork.starting_price) || 0),
    imageUrl: artwork.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop"
  }
}
