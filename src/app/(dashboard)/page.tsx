import { PageContainer } from "@/components/page-container"
import { EmptyState } from "@/components/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <PageContainer heading="Dashboard" description="Bienvenue sur votre espace.">
      <EmptyState
        icon={LayoutDashboard}
        heading="Prêt à démarrer"
        description="Ce dashboard sera personnalisé selon votre projet."
      />
    </PageContainer>
  )
}
