"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ImageModalProps {
  imageUrl: string | null
  title: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageModal({ imageUrl, title, open, onOpenChange }: ImageModalProps) {
  if (!imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
        <DialogTitle className="sr-only">
          Imagen en tamaño completo de {title || "Obra"}
        </DialogTitle>
        <div className="relative w-full h-[85vh]">
          <Image
            src={imageUrl}
            alt={title || "Obra"}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute -top-4 -right-4 sm:-right-8 sm:-top-8 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors backdrop-blur-sm text-foreground"
          aria-label="Cerrar imagen"
        >
          <X className="size-6" />
        </button>
      </DialogContent>
    </Dialog>
  )
}
