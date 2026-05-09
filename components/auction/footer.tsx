import { Home } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Home className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-medium text-foreground">
              TECHO
            </span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Todos los fondos recaudados se destinan íntegramente a la
            construcción de viviendas para familias de escasos recursos.
          </p>
          <p className="text-xs text-muted-foreground/70">
            © 2026 TECHO. Todos los derechos reservados. Desarrollado por <a href="https://innokode.com.mx" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Innokode</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
