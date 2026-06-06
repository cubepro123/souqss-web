REVOKE SELECT (phone) ON public.profiles FROM anon;
REVOKE SELECT (phone) ON public.shops FROM anon;
GRANT SELECT (id, display_name, city, avatar_url, created_at, updated_at) ON public.profiles TO anon;
GRANT SELECT (id, user_id, name, description, shop_type, service_category, city, logo_url, created_at, updated_at) ON public.shops TO anon;