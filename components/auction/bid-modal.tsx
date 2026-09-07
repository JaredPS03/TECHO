"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ArtworkDisplay, BidderInfo } from "@/lib/types"
import { CheckCircle2 } from "lucide-react"

interface BidModalProps {
  artwork: ArtworkDisplay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  bidderInfo: BidderInfo | null
  onBidSubmit: (bidAmount: number, info: BidderInfo) => Promise<boolean>
}

export function BidModal({
  artwork,
  open,
  onOpenChange,
  bidderInfo,
  onBidSubmit
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedAmount, setSubmittedAmount] = useState(0)
  const [error, setError] = useState("")

  // Pre-fill from bidderInfo when modal opens or bidderInfo changes
  useEffect(() => {
    if (open) {
      if (bidderInfo) {
        setFullName(bidderInfo.fullName)
        setWhatsapp(bidderInfo.whatsapp)
        setEmail(bidderInfo.email)
      } else {
        setFullName("")
        setWhatsapp("")
        setEmail("")
      }
      if (artwork) {
        setBidAmount((artwork.currentBid + 500).toString())
      } else {
        setBidAmount("")
      }
      setIsSuccess(false)
      setError("")
    }
  }, [open, bidderInfo, artwork])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artwork) return

    const amount = parseFloat(bidAmount)
    const minBid = artwork.currentBid + 500
    
    if (isNaN(amount) || amount < minBid) {
      setError(`La puja mínima es $${minBid.toLocaleString()}`)
      return
    }

    if (!fullName.trim() || !whatsapp.trim() || !email.trim()) {
      setError("Todos los campos son requeridos")
      return
    }

    setError("")
    setIsSubmitting(true)
    
    const success = await onBidSubmit(amount, { 
      fullName: fullName.trim(), 
      whatsapp: whatsapp.trim(), 
      email: email.trim() 
    })
    
    setIsSubmitting(false)
    
    if (success) {
      setSubmittedAmount(amount)
      setIsSuccess(true)
      
      // Close modal after showing success
      setTimeout(() => {
        onOpenChange(false)
      }, 3000)
    } else {
      setError("Error al enviar la puja. Por favor intenta de nuevo.")
    }
  }

  if (!artwork) return null

  const minimumBid = artwork.currentBid + 500
  const formattedMinimum = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0
  }).format(minimumBid)

  const formattedSubmitted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0
  }).format(submittedAmount)

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="backdrop-blur-sm sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-12 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-foreground">
              ¡Puja Confirmada!
            </h3>
              <p className="mt-2 text-lg font-medium text-foreground">
                {formattedSubmitted} MXN
              </p>
            <p className="mt-1 text-sm text-muted-foreground">
              por &ldquo;{artwork.title}&rdquo;
            </p>
            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>Gracias, <strong>{fullName}</strong></p>
              <p className="mt-1">Te contactaremos pronto por WhatsApp o correo electrónico para coordinar los detalles.</p>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Todos los fondos apoyan la construcción de viviendas para familias de escasos recursos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Hacer puja
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {artwork.title} — {artwork.artist}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bidAmount">
              Monto de la puja
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (mínimo {formattedMinimum} MXN)
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="bidAmount"
                type="number"
                placeholder={minimumBid.toString()}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minimumBid}
                step={500}
                required
                className="pl-7"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp / Teléfono</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Confirmar Oferta"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Al confirmar, aceptas ser contactado sobre esta puja.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
