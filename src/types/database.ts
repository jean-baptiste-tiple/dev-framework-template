// Types auto-générés par Supabase CLI
// Régénérer avec : pnpm db:types
//
// Ce fichier est un placeholder. Après avoir configuré Supabase et créé
// vos tables, lancez `pnpm db:types` pour générer les types réels.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
