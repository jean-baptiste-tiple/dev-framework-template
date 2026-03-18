// Types auto-générés par Supabase CLI
// Régénérer avec : pnpm db:types
//
// Ce fichier est un placeholder. Il sera écrasé par la commande ci-dessus
// une fois le projet Supabase configuré.

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
