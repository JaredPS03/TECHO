import { Header } from "@/components/auction/header"
import { Hero } from "@/components/auction/hero"
import { ArtworkGallery } from "@/components/auction/artwork-gallery"
import { Footer } from "@/components/auction/footer"

export default function AuctionPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <ArtworkGallery />
      </main>
      <Footer />
    </div>
  )
}
