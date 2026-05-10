"use client"

import { useState } from "react"
import { Phone, Mail, ChevronDown, ChevronUp } from "lucide-react"
import type { Bid } from "@/lib/types"

interface BidListProps {
  bids: Bid[]
}

export function BidList({ bids }: BidListProps) {
  const [expandedArtworks, setExpandedArtworks] = useState<Record<string, boolean>>({})

  if (bids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card p-12 text-center">
        <p className="text-muted-foreground">No hay pujas registradas</p>
      </div>
    )
  }

  // Group bids by artwork
  const groupedBids = bids.reduce((acc, bid) => {
    const artworkId = bid.artwork_id
    if (!acc[artworkId]) {
      acc[artworkId] = {
        artwork: bid.artwork,
        bids: []
      }
    }
    acc[artworkId].bids.push(bid)
    return acc
  }, {} as Record<string, { artwork: any; bids: Bid[] }>)

  const toggleExpand = (id: string) => {
    setExpandedArtworks(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedBids).map(([artworkId, group]) => {
        const isExpanded = expandedArtworks[artworkId]
        const artwork = group.artwork

        const highestBid = Math.max(...group.bids.map(b => Number(b.amount)))

        return (
          <div key={artworkId} className="overflow-hidden rounded-xl border border-border/40 bg-card">
            {/* Header (Artwork summary) */}
            <div 
              className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpand(artworkId)}
            >
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {artwork?.image_url ? (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title || "Obra"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{artwork?.title || "Obra eliminada"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.bids.length} puja{group.bids.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-muted-foreground">Puja máxima</p>
                  <p className="font-semibold text-emerald-600">
                    ${highestBid.toLocaleString()} MXN
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Bids list (Dropdown content) */}
            {isExpanded && (
              <div className="border-t border-border/40 bg-muted/20 p-4">
                <div className="space-y-3">
                  {group.bids.map((bid) => {
                    const date = new Date(bid.created_at)
                    const formattedDate = date.toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })

                    return (
                      <div key={bid.id} className="flex items-start justify-between rounded-lg bg-background p-3 shadow-sm border border-border/40">
                        <div>
                          <p className="font-medium text-foreground">{bid.bidder_name}</p>
                          <div className="mt-1 flex flex-wrap gap-3">
                            <a
                              href={`https://wa.me/${bid.bidder_whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Phone className="size-3" />
                              {bid.bidder_whatsapp}
                            </a>
                            <a
                              href={`mailto:${bid.bidder_email}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Mail className="size-3" />
                              {bid.bidder_email}
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${Number(bid.amount).toLocaleString()} MXN
                          </p>
                          <p className="text-xs text-muted-foreground">{formattedDate}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
