"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Search } from "lucide-react"
import type { Artwork } from "@/lib/types"

interface ArtworkListProps {
  artworks: Artwork[]
  onEdit: (artwork: Artwork) => void
  onDelete: (id: string) => void
  onCloseAuction: (id: string) => void
  onViewHistory: (artwork: Artwork) => void
}

export function ArtworkList({ artworks, onEdit, onDelete, onCloseAuction, onViewHistory }: ArtworkListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredArtworks = artworks.filter((artwork) => {
    const q = searchQuery.toLowerCase()
    return (
      artwork.title.toLowerCase().includes(q) ||
      artwork.artist.toLowerCase().includes(q) ||
      artwork.technique.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {artworks.length > 0 && (
        <div className="relative mb-6 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Buscar por obra, artista o técnica..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {artworks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-12 text-center">
          <p className="text-muted-foreground">No hay obras registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Haz clic en &ldquo;Agregar Obra&rdquo; para comenzar
          </p>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-12 text-center">
          <p className="text-muted-foreground">No se encontraron obras con esa búsqueda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 flex-wrap sm:flex-nowrap"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {artwork.image_url ? (
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {artwork.artist} · {artwork.technique}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Puja actual</p>
                    <p className="text-lg font-semibold text-foreground">
                      ${Math.max(Number(artwork.current_bid) || 0, Number(artwork.starting_price) || 0).toLocaleString()} MXN
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      artwork.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {artwork.is_active ? "Activa" : "Inactiva"}
                  </span>
                  {artwork.starting_price > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Precio inicial: ${artwork.starting_price.toLocaleString()} MXN
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                {artwork.is_active && (
                  <Button variant="outline" size="sm" onClick={() => onCloseAuction(artwork.id)}>
                    Cerrar subasta
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onViewHistory(artwork)}>
                  Historial
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(artwork)}>
                  <Pencil className="size-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(artwork.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
