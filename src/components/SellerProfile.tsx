import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Listing, Profile } from '@/lib/types';

interface SellerProfileProps {
  sellerId: string | null;
  onClose: () => void;
  onOpenListing: (l: Listing) => void;
  currentUser: User | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  profiles?: { full_name: string | null };
}

function Stars({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-xl ${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform ${interactive && hover >= i ? 'scale-110' : ''}`}
        >
          <span className={(hover || rating) >= i ? 'text-amber-400' : 'text-[#ddd]'}>★</span>
        </button>
      ))}
    </div>
  );
}

export function SellerProfile({ sellerId, onClose, onOpenListing, currentUser }: SellerProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'reviews'>('listings');
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('listings').select('*').eq('user_id', sellerId).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, profiles(full_name)').eq('seller_id', sellerId).order('created_at', { ascending: false }),
    ]).then(([p, l, r]) => {
      setProfile(p.data as Profile);
      setListings((l.data || []) as Listing[]);
      setReviews((r.data || []) as Review[]);
      if (currentUser) {
        setAlreadyReviewed((r.data || []).some((rv: Review) => rv.reviewer_id === currentUser.id));
      }
      setLoading(false);
    });
  }, [sellerId, currentUser?.id]);

  const submitReview = async () => {
    if (!currentUser || !sellerId || !myRating) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      seller_id: sellerId,
      reviewer_id: currentUser.id,
      listing_id: listings[0]?.id,
      rating: myRating,
      comment: myComment.trim() || null,
    });
    if (!error) {
      setAlreadyReviewed(true);
      const { data } = await supabase.from('reviews').select('*, profiles(full_name)').eq('seller_id', sellerId).order('created_at', { ascending: false });
      setReviews((data || []) as Review[]);
    }
    setSubmittingReview(false);
  };

  if (!sellerId) return null;

  const memberDate = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[650] flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[620px] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#1e4e1e] to-[#2d6e2d] p-6 pb-14">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">×</button>
          {loading ? (
            <div className="text-white/50 text-sm">Loading profile…</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#d94f1e] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {(profile?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white text-xl font-extrabold">{profile?.full_name || 'Seller'}</div>
                <div className="text-white/60 text-[12px] mt-0.5">📍 {profile?.location || 'South Sudan'}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <span key={i} className={`text-sm ${(profile?.rating ?? 0) >= i ? 'text-amber-400' : 'text-white/20'}`}>★</span>)}
                  </div>
                  <span className="text-white text-[13px] font-bold">{profile?.rating ?? '5.0'}</span>
                  <span className="text-white/50 text-[12px]">({profile?.review_count ?? 0} reviews)</span>
                  {profile?.verified && <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Verified</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex border-b border-[#f0ebe6] -mt-8 mx-4 bg-white rounded-xl shadow-md z-10 relative">
          {[
            { label: 'Listings', value: listings.length },
            { label: 'Reviews', value: reviews.length },
            { label: 'Member since', value: memberDate.split(' ')[1] || '—' },
          ].map(s => (
            <div key={s.label} className="flex-1 text-center py-3 border-r border-[#f0ebe6] last:border-0">
              <div className="text-[16px] font-extrabold text-[#1a1a1a]">{s.value}</div>
              <div className="text-[10px] text-[#aaa] font-semibold uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f0ebe6] mt-3 px-4">
          {(['listings', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-[13px] font-bold capitalize border-b-2 transition-colors ${tab === t ? 'border-[#d94f1e] text-[#d94f1e]' : 'border-transparent text-[#999]'}`}>
              {t} ({t === 'listings' ? listings.length : reviews.length})
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {tab === 'listings' ? (
            listings.length === 0 ? (
              <div className="text-center py-10 text-[#aaa]">
                <div className="text-3xl mb-2">📭</div>
                <div className="font-semibold text-[13px]">No active listings</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {listings.map(L => (
                  <div
                    key={L.id}
                    onClick={() => { onOpenListing(L); onClose(); }}
                    className="bg-[#faf5f2] rounded-xl border border-[#f0ebe6] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-24 flex items-center justify-center text-4xl" style={{ background: bgMap[L.bg_color || 'bg-peach'] || '#fde8de' }}>
                      {L.emoji || '🛒'}
                    </div>
                    <div className="p-2.5">
                      <div className="text-[13px] font-extrabold text-[#d94f1e]">{L.price_label}</div>
                      <div className="text-[11px] font-semibold text-[#1a1a1a] line-clamp-2 mt-0.5">{L.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div>
              {/* Leave a review */}
              {currentUser && currentUser.id !== sellerId && !alreadyReviewed && (
                <div className="bg-[#fff5f0] border border-[#fde8de] rounded-xl p-4 mb-4">
                  <div className="text-[13px] font-bold mb-2">Leave a review</div>
                  <Stars rating={myRating} interactive onRate={setMyRating} />
                  <textarea
                    rows={2}
                    placeholder="Share your experience (optional)"
                    className="w-full mt-2 bg-white border border-[#e5ddd8] rounded-lg px-3 py-2 text-[13px] outline-none resize-none focus:border-[#d94f1e] transition-colors"
                    value={myComment}
                    onChange={e => setMyComment(e.target.value)}
                  />
                  <button
                    onClick={submitReview}
                    disabled={!myRating || submittingReview}
                    className="mt-2 bg-[#d94f1e] text-white rounded-lg px-4 py-2 text-[13px] font-bold disabled:opacity-50 hover:bg-[#c04418] transition-colors"
                  >{submittingReview ? 'Submitting…' : 'Submit Review'}</button>
                </div>
              )}
              {alreadyReviewed && <div className="bg-green-50 text-green-700 text-[12px] font-semibold text-center py-2 rounded-lg mb-4 border border-green-200">✓ You've reviewed this seller</div>}

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-[#aaa]">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="font-semibold text-[13px]">No reviews yet</div>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="border-b border-[#f5f0ed] last:border-0 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#f5f0ed] rounded-full flex items-center justify-center text-[11px] font-bold">
                        {(r.profiles?.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold">{r.profiles?.full_name || 'Buyer'}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <span key={i} className={`text-sm ${r.rating >= i ? 'text-amber-400' : 'text-[#ddd]'}`}>★</span>)}
                    </div>
                  </div>
                  {r.comment && <p className="text-[13px] text-[#555] leading-relaxed">{r.comment}</p>}
                  <div className="text-[11px] text-[#aaa] mt-1">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
