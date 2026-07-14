import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Usa a service_role key — bypassa RLS. Só para jobs de servidor
// confiáveis (ex: cron), nunca importar em código que roda no browser
// ou em rotas que atendem requests de usuários comuns.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
