
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  shop_type TEXT NOT NULL CHECK (shop_type IN ('seller','service_provider')),
  service_category TEXT,
  city TEXT,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shops are viewable by everyone"
  ON public.shops FOR SELECT USING (true);

CREATE POLICY "Users can create their own shop"
  ON public.shops FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shop"
  ON public.shops FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shop"
  ON public.shops FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_shops_type ON public.shops(shop_type);
CREATE INDEX idx_shops_service_category ON public.shops(service_category);
