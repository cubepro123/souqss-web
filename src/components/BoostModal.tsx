import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/lib/types';

interface BoostModalProps {
  listing: Listing | null;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const TIERS = [
  {
    id: 'basic',
    name: 'Basic Boost',
    emoji: '🚀',
    price: 'SSP 5,000',
    duration: '3 days',
    days: 3,
    perks: ['2x more views', 'Higher in search results', 'Bold listing border'],
    color: '#4a9eff',
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    emoji: '⭐',
    price: 'SSP 12,000',
    duration: '7 days',
    days: 7,
    perks: ['5x more views', 'Top of category page', 'Premium badge', 'Featured in homepage'],
    color: '#d94f1e',
    popular: true,
  },
  {
    id: 'top',
    name: 'Top Ad',
    emoji: '👑',
    price: 'SSP 25,000',
    duration: '14 days',
    days: 14,
    perks: ['10x more views', 'Pinned at very top', 'Top Ad crown badge', 'Homepage banner slot', 'Push notification to buyers'],
    color: '#f59e0b',
  },
];

export function BoostModal({ listing, onClose, user, onSuccess }: BoostModalProps) {
  const [selected, setSelected] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!listing) return null;

  const handleBoost = async () => {
    if (!user) return;
    const tier = TIERS.find(t => t.id === selected)!;
    setLoading(true);
    const expiresAt = new Date(Date.now() + tier.days * 24 * 60 * 60 * 1000).toISOString();

    // Upsert boost record
    await supabase.from('boosts').upsert({
      listing_id: listing.id,
      user_id: user.id,
      tier: selected,
      expires_at: expiresAt,
      starts_at: new Date().toISOString(),
    });

    // Update listing boost fields
    await supabase.from('listings').update({
      is_premium: true,
      is_boosted: true,
      boost_tier: selected,
      boost_expires_at: expiresAt,
    }).eq('id', listing.id);

    // Notify seller
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'boost_expired',
      title: `Your ${tier.name} is active!`,
      body: `"${listing.title}" is now boosted for ${tier.duration}. Expires ${new Date(expiresAt).toLocaleDateString()}.`,
      listing_id: listing.id,
    });

    setLoading(false);
    setDone(true);
    setTimeout(() => { onClose(); onSuccess(); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[650] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] font-bold text-[#d94f1e] uppercase tracking-wide mb-1">Boost your ad</div>
              <h3 className="text-white text-xl font-extrabold">Get more views, faster</h3>
              <p className="text-white/50 text-[13px] mt-1 line-clamp-1">"{listing.title}"</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">×</button>
          </div>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <div className="text-xl font-extrabold text-[#1a1a1a] mb-2">Boost activated!</div>
            <div className="text-[#777] text-[14px]">Your listing is now live in premium placement.</div>
          </div>
        ) : (
          <div className="p-5">
            <div className="space-y-3 mb-5">
              {TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSelected(tier.id)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all relative ${selected === tier.id ? 'border-[#d94f1e] bg-[#fff5f0]' : 'border-[#e5ddd8] hover:border-[#d94f1e]/50'}`}
                >
                  {tier.popular && (
                    <span className="absolute top-3 right-3 bg-[#d94f1e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Most Popular</span>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <div className="font-bold text-[14px]">{tier.name}</div>
                      <div className="text-[12px] text-[#777]">{tier.duration}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-extrabold text-[15px]" style={{ color: tier.color }}>{tier.price}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.perks.map(p => (
                      <span key={p} className="text-[11px] bg-[#f5f0ed] text-[#555] rounded-full px-2 py-0.5 font-semibold">✓ {p}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-[12px] text-amber-800">
              💳 Payment via mobile money (MTN, Zain, Vivacell) or bank transfer. Our team will contact you to confirm payment.
            </div>

            <button
              onClick={handleBoost}
              disabled={loading}
              className="w-full bg-[#d94f1e] text-white rounded-xl py-3.5 text-[15px] font-bold hover:bg-[#c04418] transition-colors disabled:opacity-60"
            >{loading ? 'Activating boost…' : `Boost Now — ${TIERS.find(t => t.id === selected)?.price}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}
