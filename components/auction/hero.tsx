import Image from "next/image"

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-0 pb-16 sm:px-6 sm:pt-0 sm:pb-24 lg:px-8 lg:pt-0 lg:pb-32">
      <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
        <div className="relative w-full max-w-full mx-auto -mb-18 -mt-12 sm:-mt-24 sm:-mb-24">
          <Image
            src="/hero-animation.gif"
            alt="Subasta de Arte con Causa"
            width={1200}
            height={600}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />
        </div>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Cada obra cuenta una historia. Cada compra construye un hogar. Los fondos
          recaudados apoyan directamente la construcción de viviendas progresivas a
          cientos de familias en situación de vulnerabilidad en la ciudad de Oaxaca.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex size-2 rounded-full bg-emerald-500" />
          <span>Subasta activa</span>
        </div>
      </div>
    </section>
  )
}
