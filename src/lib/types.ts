export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  rating: number | null;
  review_count: number | null;
  verified: boolean | null;
  member_since: string | null;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  price_label: string;
  category: string;
  condition: string;
  location: string;
  emoji: string | null;
  bg_color: string | null;
  is_premium: boolean | null;
  is_verified: boolean | null;
  views: number | null;
  phone: string | null;
  status: string;
  created_at: string;
  profiles?: Profile | null;
}
