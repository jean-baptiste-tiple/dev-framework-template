// Route group protégé par auth — renommer ou supprimer selon le projet.
// IMPORTANT : un route group avec layout DOIT avoir au moins un page.tsx,
// sinon le build Next.js échoue (missing client-reference-manifest).
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r md:block">
        {/* Sidebar — à implémenter par projet */}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
