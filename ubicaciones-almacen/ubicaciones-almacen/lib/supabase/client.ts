import { createBrowserClient } from "@supabase/ssr";

// Usar SIEMPRE este cliente en Client Components ("use client").
// Para Server Components / Server Actions usar lib/supabase/server.ts.
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
