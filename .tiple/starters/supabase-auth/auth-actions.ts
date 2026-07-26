"use server"

import { revalidatePath } from "next/cache"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

/**
 * Les messages d'erreur d'auth sont des CONSTANTES, jamais `error.message`.
 * Supabase renvoie « User already registered » sur un email déjà inscrit : le relayer au
 * client donne un oracle d'énumération de comptes sur la page d'inscription. Même logique au
 * login : ne jamais distinguer « email inconnu » de « mot de passe faux ».
 */
const GENERIC_ERROR = "Une erreur est survenue. Réessayez."
const INVALID_CREDENTIALS = "Email ou mot de passe incorrect."

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "8 caractères minimum"),
})

const emailSchema = z.object({ email: z.string().email() })
const passwordSchema = z.object({ password: z.string().min(8, "8 caractères minimum") })

function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL manquant — voir .env.example")
  return url.replace(/\/$/, "")
}

export async function login(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: INVALID_CREDENTIALS }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: INVALID_CREDENTIALS }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  })
  // Réponse identique que le compte existe ou non : pas d'oracle d'énumération.
  if (error) return { error: GENERIC_ERROR }

  revalidatePath("/", "layout")
  return { success: "Vérifiez votre email pour confirmer votre compte." }
}

export async function forgotPassword(formData: FormData) {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  // Message de succès même sur email invalide ou inconnu : l'existence d'un compte ne fuite pas.
  const confirmation = { success: "Si un compte existe, un email vous a été envoyé." }
  if (!parsed.success) return confirmation

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  })

  return confirmation
}

export async function resetPassword(formData: FormData) {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mot de passe invalide" }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
    if (error) return { error: GENERIC_ERROR }

    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    // redirect() lève NEXT_REDIRECT : sans ce rethrow, le catch avalerait la redirection.
    unstable_rethrow(error)
    return { error: GENERIC_ERROR }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
