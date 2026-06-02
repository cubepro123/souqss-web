import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/lib/types';

interface SavedListingsProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onOpenListing: (l: Listing) => void;
  onAuthRequired: () => void;
}

export function SavedListings({ open, onClose, user, onOpenListing, onAuthRequired }: SavedListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (!user) { onAuthRequired(); onClose(); return; }
    setLoading(true);
    supabase
      .from('saved_listings')
      .select('listing_id, listings(*, profiles(full_name, rating, verified))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const ls = (data || []).map((r: any) => r.listings).filter(Boolean) as Listing[];
        setListings(ls);
        setLoading(false);
      });
  }, [open, user?.id]);

  const unsave = async (id: string) => {
    await supabase.from('saved_listings').delete().eq('user_id', user!.id).eq('listing_id', id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#f0ebe6]">
          <h3 className="text-[18px] font-extrabold">❤️ Saved Listings</h3>
          <button onClick={onClose} className="text-2xl text-[#aaa] hover:text-[#1a1a1a]">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="text-center py-12 text-[#aaa]">Loading…</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-[#aaa]">
              <div className="text-4xl mb-3">🔖</div>
              <div className="font-semibold">No saved listings yet</div>
              <div className="text-[13px] mt-1">Tap 🔖 on any listing to save it</div>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(L => (
                <div key={L.id} className="flex items-center gap-3 bg-[#faf5f2] rounded-xl p-3.5 border border-[#f0ebe6] cursor-pointer hover:bg-[#fff5f0] transition-colors" onClick={() => { onOpenListing(L); onClose(); }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 bg-[#fde8de]">{L.emoji || '🛒'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">{L.title}</div>
                    <div className="text-[#d94f1e] font-bold text-[13px]">{L.price_label}</div>
                    <div className="text-[11px] text-[#aaa] mt-0.5">📍 {L.location}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); unsave(L.id); }} className="text-[#aaa] hover:text-red-500 transition-colors text-lg px-1">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
