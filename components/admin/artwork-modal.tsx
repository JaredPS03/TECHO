"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import type { Artwork } from "@/lib/types"

interface ArtworkModalProps {
  artwork: Artwork | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ArtworkModal({
  artwork,
  open,
  onOpenChange,
  onSaved
}: ArtworkModalProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [technique, setTechnique] = useState("")
  const [dimensions, setDimensions] = useState("")
  const [year, setYear] = useState("")
  const [description, setDescription] = useState("")
  const [startingPrice, setStartingPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (artwork) {
        setTitle(artwork.title)
        setArtist(artwork.artist)
        setTechnique(artwork.technique)
        setDimensions(artwork.dimensions || "")
        setYear(artwork.year || "")
        setDescription(artwork.description || "")
        setStartingPrice(artwork.starting_price?.toString() || "")
        setImageUrl(artwork.image_url || "")
        setIsActive(artwork.is_active)
      } else {
        setTitle("")
        setArtist("")
        setTechnique("")
        setDimensions("")
        setYear("")
        setDescription("")
        setStartingPrice("")
        setImageUrl("")
        setIsActive(true)
      }
      setError("")
    }
  }, [open, artwork])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error de red" }))
        setError(`Fallo: ${errorData.error || ""} ${errorData.details ? "(" + errorData.details + ")" : ""}`)
        console.error("Server error details:", errorData)
      }
    } catch {
      setError("Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !artist.trim() || !technique.trim()) {
      setError("Título, artista y técnica son requeridos")
      return
    }

    setIsSubmitting(true)

    try {
      const method = artwork ? "PUT" : "POST"
      const url = artwork ? `/api/admin/artworks/${artwork.id}` : "/api/admin/artworks"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          technique: technique.trim(),
          dimensions: dimensions.trim() || null,
          year: year.trim() || null,
          description: description.trim() || null,
          starting_price: parseFloat(startingPrice) || 0,
          image_url: imageUrl || null,
          is_active: isActive
        })
      })

      if (res.ok) {
        onSaved()
      } else {
        const data = await res.json()
        setError(data.error || "Error al guardar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {artwork ? "Editar Obra" : "Nueva Obra"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Imagen</Label>
            <div className="flex items-start gap-4">
              {imageUrl ? (
                <div className="relative size-24 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex size-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted"
                >
                  {isUploading ? (
                    <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Upload className="size-5" />
                      <span className="mt-1 text-xs">Subir</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex-1">
                <Input
                  placeholder="O pegar URL de imagen"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="technique">Técnica *</Label>
              <Input
                id="technique"
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                placeholder="Óleo sobre lienzo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensiones</Label>
              <Input
                id="dimensions"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="50x70 cm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startingPrice">Precio inicial ($)</Label>
              <Input
                id="startingPrice"
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la obra..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="isActive" className="font-normal">
              Obra activa (visible en la subasta)
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : artwork ? "Guardar cambios" : "Crear obra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
