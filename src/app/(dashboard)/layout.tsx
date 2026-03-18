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
