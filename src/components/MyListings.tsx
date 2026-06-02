import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/lib/types';

interface MyListingsProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onOpenListing: (l: Listing) => void;
}

export function MyListings({ open, onClose, user, onOpenListing }: MyListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'sold'>('active');

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase.from('listings')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings((data || []) as Listing[]); setLoading(false); });
  }, [open, user?.id]);

  const markSold = async (id: string) => {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (!open) return null;

  const filtered = listings.filter(l => tab === 'active' ? l.status === 'active' : l.status === 'sold');

  return (
    <div className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#f0ebe6]">
          <h3 className="text-[18px] font-extrabold">My Listings</h3>
          <button onClick={onClose} className="text-2xl text-[#aaa] hover:text-[#1a1a1a]">×</button>
        </div>
        <div className="flex border-b border-[#f0ebe6]">
          {(['active', 'sold'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-[13px] font-bold capitalize transition-colors border-b-2 ${tab === t ? 'border-[#d94f1e] text-[#d94f1e]' : 'border-transparent text-[#999]'}`}>
              {t} ({listings.filter(l => l.status === t).length})
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="text-center py-12 text-[#aaa]">Loading your listings…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#aaa]">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-semibold">No {tab} listings</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(L => (
                <div key={L.id} className="flex items-center gap-3 bg-[#faf5f2] rounded-xl p-3.5 border border-[#f0ebe6]">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: '#fde8de' }}>{L.emoji || '🛒'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">{L.title}</div>
                    <div className="text-[#d94f1e] font-bold text-[13px]">{L.price_label}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-[#aaa]">👁 {L.views ?? 0} views</span>
                      <span className="text-[11px] text-[#aaa]">📍 {L.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {L.status === 'active' && (
                      <button onClick={() => markSold(L.id)} className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-100 transition-colors whitespace-nowrap">✓ Mark Sold</button>
                    )}
                    <button onClick={() => deleteListing(L.id)} className="text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-100 transition-colors">🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
