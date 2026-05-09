import { Home } from "lucide-react"

import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border/40 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="TECHO Logo" 
            width={120} 
            height={40} 
            className="h-8 w-auto object-contain"
            priority
          />
        </div>

        <nav className="hidden sm:block">
          <span className="text-sm font-medium text-foreground">
            Subasta Benéfica 2026
          </span>
        </nav>
      </div>
    </header>
  )
}
