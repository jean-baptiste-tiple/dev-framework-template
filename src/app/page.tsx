import { redirect } from "next/navigation"

export default function Home() {
  // Redirige vers la page principale du projet
  // Modifier cette destination selon le projet
  redirect("/dashboard")
}
