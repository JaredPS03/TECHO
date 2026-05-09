"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    fetch("/api/admin/session")
      .then(res => {
        if (res.ok) {
          router.push("/admin/dashboard")
        }
      })
      .finally(() => setIsCheckingSession(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        router.push("/admin/dashboard")
      } else {
        const data = await res.json()
        setError(data.error || "Error al iniciar sesión")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Home className="size-6 text-foreground" strokeWidth={1.5} />
            <span className="text-xl font-semibold tracking-tight text-foreground">TECHO</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
            Panel de Administración
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@techo.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    </div>
  )
}
