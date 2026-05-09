"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { ArtworkDisplay } from "@/lib/types"

interface ArtworkCardProps {
  artwork: ArtworkDisplay
  onBid: (artwork: ArtworkDisplay) => void
  onImageClick?: (artwork: ArtworkDisplay) => void
}

export function ArtworkCard({ artwork, onBid, onImageClick }: ArtworkCardProps) {
  const formattedBid = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(artwork.currentBid)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-muted cursor-pointer"
        onClick={() => onImageClick?.(artwork)}
      >
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {artwork.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {artwork.artist} · {artwork.technique}
          </p>
          {artwork.description && (
            <p
              className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed"
              title={artwork.description}
            >
              {artwork.description}
            </p>
          )}
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Puja actual
              </span>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
                {formattedBid} MXN
              </p>
            </div>
          </div>
          <Button
            onClick={() => onBid(artwork)}
            className="mt-4 w-full"
            size="lg"
          >
            Hacer puja
          </Button>
        </div>
      </div>
    </article>
  )
}
