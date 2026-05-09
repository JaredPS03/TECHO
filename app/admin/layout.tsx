import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | TECHO Subasta",
  description: "Panel de administración de la subasta benéfica TECHO"
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
