"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { ArtworkCard } from "./artwork-card"
import { BidModal } from "./bid-modal"
import type { Artwork, ArtworkDisplay } from "@/lib/types"
import { toArtworkDisplay } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

import { ImageModal } from "./image-modal"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'An error occurred while fetching the data.')
  }
  return res.json()
}

interface BidderInfo {
  fullName: string
  whatsapp: string
  email: string
}

export function ArtworkGallery() {
  const { data: artworks, error, mutate } = useSWR<Artwork[]>("/api/artworks", fetcher, {
    refreshInterval: 5000 // Refresh every 5 seconds to get updated bids
  })
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkDisplay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImageArtwork, setSelectedImageArtwork] = useState<ArtworkDisplay | null>(null)
  const [bidderInfo, setBidderInfo] = useState<BidderInfo | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("bidderInfo")
    if (stored) {
      try {
        setBidderInfo(JSON.parse(stored))
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsLoaded(true)
  }, [])

  const saveBidderInfo = (info: BidderInfo) => {
    setBidderInfo(info)
    localStorage.setItem("bidderInfo", JSON.stringify(info))
  }

  const handleBidClick = (artwork: ArtworkDisplay) => {
    setSelectedArtwork(artwork)
    setIsModalOpen(true)
  }

  const handleBidSubmit = async (bidAmount: number, info: { fullName: string; whatsapp: string; email: string }) => {
    if (!selectedArtwork) return

    // Save bidder info to localStorage for future pre-filling
    saveBidderInfo(info)
    
    // Submit bid to API
    const response = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artwork_id: selectedArtwork.id,
        amount: bidAmount,
        bidder_name: info.fullName,
        bidder_whatsapp: info.whatsapp,
        bidder_email: info.email
      })
    })

    if (response.ok) {
      // Refresh artworks to get updated bid
      mutate()
    }

    return response.ok
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground">Error al cargar las obras</p>
      </section>
    )
  }

  if (!artworks || !isLoaded) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por técnica, artista..." disabled />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[4/5]" />
          ))}
        </div>
      </section>
    )
  }

  const displayArtworks = artworks.map(toArtworkDisplay).filter((artwork) => {
    const q = searchQuery.toLowerCase()
    return (
      artwork.title.toLowerCase().includes(q) ||
      artwork.artist.toLowerCase().includes(q) ||
      artwork.technique.toLowerCase().includes(q)
    )
  })

  const handleImageClick = (artwork: ArtworkDisplay) => {
    setSelectedImageArtwork(artwork)
    setIsImageModalOpen(true)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      {artworks.length > 0 && (
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Obras en subasta
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Buscar por obra, artista o técnica..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {artworks.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay obras disponibles en este momento</p>
      ) : displayArtworks.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron obras con esa búsqueda</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onBid={handleBidClick}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      )}

      <BidModal
        artwork={selectedArtwork}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        bidderInfo={bidderInfo}
        onBidSubmit={handleBidSubmit}
      />

      <ImageModal
        imageUrl={selectedImageArtwork?.imageUrl || null}
        title={selectedImageArtwork?.title || null}
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
      />
    </section>
  )
}
