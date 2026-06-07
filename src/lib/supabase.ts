// Re-export the integration-managed Supabase client so all pages share one
// authenticated session and target the correct project.
export { supabase } from '@/integrations/supabase/client';
