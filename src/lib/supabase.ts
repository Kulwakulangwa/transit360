// Re-export the integration-managed Supabase client so all pages share one
// authenticated session and target the correct project. Cast to `any` to
// allow pages that reference tables not yet in the generated types.
import { supabase as typedClient } from '@/integrations/supabase/client';
export const supabase: any = typedClient;
