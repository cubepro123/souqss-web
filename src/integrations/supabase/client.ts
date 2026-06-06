import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fnsuxvxzcyaphphvhwjj.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc3V4dnh6Y3lhcGhwaHZod2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTMzODMsImV4cCI6MjA5NDg2OTM4M30.qM4DtoWFTkuUAuUlsPoeY8uGd-5YqP1vCOpqSzPob48';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
