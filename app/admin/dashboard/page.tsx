"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Home, Plus, LogOut, ImageIcon, Users, Package } from "lucide-react"
import { ArtworkList } from "@/components/admin/artwork-list"
import { BidList } from "@/components/admin/bid-list"
import { ArtworkModal } from "@/components/admin/artwork-modal"
import type { Artwork, Bid } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Unauthorized")
  return res.json()
})

type Tab = "artworks" | "bids"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("artworks")
  const [bidFilterArtworkId, setBidFilterArtworkId] = useState<string | null>(null)
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const router = useRouter()

  const { data: session, error: sessionError } = useSWR("/api/admin/session", fetcher)
  const { data: artworks, mutate: mutateArtworks } = useSWR<Artwork[]>(
    session ? "/api/admin/artworks" : null, 
    fetcher
  )
  const { data: bids, mutate: mutateBids } = useSWR<Bid[]>(
    session ? "/api/admin/bids" : null, 
    fetcher,
    { refreshInterval: 10000 }
  )

  useEffect(() => {
    if (sessionError) {
      router.push("/admin")
    }
  }, [sessionError, router])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
  }

  const handleAddArtwork = () => {
    setEditingArtwork(null)
    setIsArtworkModalOpen(true)
  }

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork)
    setIsArtworkModalOpen(true)
  }

  const handleArtworkSaved = () => {
    mutateArtworks()
    mutateBids()
    setIsArtworkModalOpen(false)
    setEditingArtwork(null)
  }

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta obra?")) return
    
    await fetch(`/api/admin/artworks/${id}`, { method: "DELETE" })
    mutateArtworks()
  }

  const handleCloseAuction = async (id: string) => {
    if (!confirm("¿Estás seguro de cerrar la subasta para esta obra? Ya no recibirá más pujas pero se guardará el récord actual.")) return
    
    const artwork = artworks?.find(a => a.id === id)
    if (!artwork) return

    await fetch(`/api/admin/artworks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...artwork,
        is_active: false
      })
    })
    mutateArtworks()
  }

  const handleViewHistory = (artwork: Artwork) => {
    setBidFilterArtworkId(artwork.id)
    setActiveTab("bids")
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  const totalBids = bids?.length || 0
  const totalArtworks = artworks?.length || 0
  const totalRaised = artworks?.reduce((sum, a) => sum + Number(a.current_bid), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0092DD] shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Home className="size-5 text-white" strokeWidth={1.5} />
            <span className="text-base font-medium tracking-tight text-white">
              TECHO Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/90">{session.admin?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-[#0092DD] hover:bg-white">
              <LogOut className="mr-2 size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Package className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Obras</p>
                <p className="text-2xl font-semibold">{totalArtworks}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pujas</p>
                <p className="text-2xl font-semibold">{totalBids}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                <ImageIcon className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recaudado</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  ${totalRaised.toLocaleString()} MXN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => {
                setActiveTab("artworks")
                setBidFilterArtworkId(null)
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "artworks"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Obras
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "bids"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pujas
            </button>
          </div>

          {activeTab === "artworks" && (
            <Button onClick={handleAddArtwork}>
              <Plus className="mr-2 size-4" />
              Agregar Obra
            </Button>
          )}
          {activeTab === "bids" && bidFilterArtworkId && (
            <Button variant="outline" onClick={() => setBidFilterArtworkId(null)}>
              Ver todas las pujas
            </Button>
          )}
        </div>

        {/* Content */}
        {activeTab === "artworks" ? (
          <ArtworkList
            artworks={artworks || []}
            onEdit={handleEditArtwork}
            onDelete={handleDeleteArtwork}
            onCloseAuction={handleCloseAuction}
            onViewHistory={handleViewHistory}
          />
        ) : (
          <BidList bids={bids?.filter(b => !bidFilterArtworkId || b.artwork_id === bidFilterArtworkId) || []} />
        )}
      </main>

      <ArtworkModal
        artwork={editingArtwork}
        open={isArtworkModalOpen}
        onOpenChange={setIsArtworkModalOpen}
        onSaved={handleArtworkSaved}
      />
    </div>
  )
}
