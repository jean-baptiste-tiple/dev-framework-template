// Route group principal — renommer selon le projet (ex: (app), (admin), etc.)
// IMPORTANT : un route group avec layout DOIT avoir au moins un page.tsx,
// sinon le build Next.js échoue (missing client-reference-manifest).

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r md:block">
        {/* Sidebar — à implémenter par projet */}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
