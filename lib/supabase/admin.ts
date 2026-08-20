import { createClient } from "@supabase/supabase-js";

// ⚠️ SOLO usar dentro de Server Actions / Route Handlers.
// Nunca importar este archivo desde un componente "use client":
// la Service Role Key bypassea RLS por completo.
export function crearClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}