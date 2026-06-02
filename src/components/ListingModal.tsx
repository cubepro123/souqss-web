import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/lib/types';

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onAuthRequired: () => void;
  user: User | null;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onViewSeller: (sellerId: string) => void;
  onBoost: (listing: Listing) => void;
}

export function ListingModal({ listing: L, onClose, onAuthRequired, user, savedIds, onToggleSave, onViewSeller, onBoost }: ListingModalProps) {
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (L) {
      setMsgBody(`Hi! I'm interested in your listing "${L.title}". Is it still available?`);
      setMsgSent(false); setShowMsgForm(false); setImgIdx(0);
      supabase.rpc('increment_views', { p_listing_id: L.id });
    }
  }, [L?.id]);

  if (!L) return null;

  const p = L.profiles;
  const images: string[] = (L as any).images || [];
  const hasImages = images.length > 0;
  const memberDate = p?.member_since ? new Date(p.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Longtime member';
  const saved = savedIds.has(L.id);
  const isOwner = user?.id === L.user_id;

  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };

  const contactSeller = (method: 'call' | 'whatsapp') => {
    if (!user) { onAuthRequired(); return; }
    const phone = (L.phone || p?.phone || '').replace(/\s+/g, '');
    const msg = encodeURIComponent(`Hi! I saw your listing on SouqSS: "${L.title}" (${L.price_label}). Is it still available?`);
    if (method === 'call') window.location.href = `tel:${phone}`;
    else window.open(`https://wa.me/${phone.replace('+', '')}?text=${msg}`, '_blank');
  };

  const sendMessage = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!msgBody.trim()) return;
    setSendingMsg(true);
    await supabase.from('messages').insert({ listing_id: L.id, sender_id: user.id, receiver_id: L.user_id, body: msgBody });
    setSendingMsg(false); setMsgSent(true);
  };

  const share = (method: 'copy' | 'whatsapp' | 'facebook') => {
    const url = window.location.href;
    const text = `Check this out on SouqSS: ${L.title} — ${L.price_label}`;
    if (method === 'copy') navigator.clipboard.writeText(url).then(() => {});
    else if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[600] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[700px] my-auto overflow-hidden shadow-2xl">

        {/* Hero — images or emoji */}
        <div className="relative" style={{ background: bgMap[L.bg_color || 'bg-peach'] || '#fde8de' }}>
          {hasImages ? (
            <div className="relative h-[280px] sm:h-[340px] overflow-hidden">
              <img src={images[imgIdx]} alt={L.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition-colors">‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-12 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition-colors">›</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />)}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <span className="text-[90px] drop-shadow-md">{L.emoji || '🛒'}</span>
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-md text-lg hover:bg-white">×</button>
          <button onClick={() => onToggleSave(L.id)} className="absolute top-3 left-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white text-sm">{saved ? '❤️' : '🔖'}</button>
          {L.is_premium && <span className="absolute bottom-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">⭐ PREMIUM</span>}
        </div>

        <div className="p-6">
          <div className="text-[24px] font-black text-[#d94f1e]">{L.price_label}</div>
          <div className="text-[17px] font-bold mt-1.5 mb-4 leading-snug">{L.title}</div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[`📍 ${L.location}`, `🏷️ ${L.condition}`, `📂 ${L.category}`, `👁 ${(L.views ?? 0) + 1} views`].map(tag => (
              <span key={tag} className="bg-[#f5f0ed] rounded-full px-3 py-1 text-[12px] font-semibold text-[#777]">{tag}</span>
            ))}
          </div>

          <p className="text-[14px] text-[#555] leading-relaxed border-t border-[#f0ebe6] pt-4 mb-5">{L.description}</p>

          {/* Seller */}
          <button
            onClick={() => onViewSeller(L.user_id)}
            className="w-full flex items-center gap-3 bg-[#f9f5f2] rounded-2xl p-4 mb-4 hover:bg-[#fff0ea] transition-colors text-left"
          >
            <div className="w-11 h-11 bg-[#d94f1e] rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {(p?.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[14px]">{p?.full_name || 'SouqSS Seller'}</div>
              <div className="text-[11px] text-[#777]">Member since {memberDate}</div>
              <div className="text-[12px] text-[#d94f1e] font-bold">{p?.rating ?? '5.0'} ★ ({p?.review_count ?? 0} reviews)</div>
            </div>
            <div className="flex items-center gap-2">
              {p?.verified && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">✓ Verified</span>}
              <span className="text-[#d94f1e] text-sm">›</span>
            </div>
          </button>

          {/* CTA buttons */}
          {isOwner ? (
            <button onClick={() => onBoost(L)} className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-3">
              ⬆️ Boost this listing — get more views
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => contactSeller('call')} className="bg-[#25D366] text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#1da851] transition-colors">📞 Call Seller</button>
              <button onClick={() => contactSeller('whatsapp')} className="bg-[#d94f1e] text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#c04418] transition-colors">💬 WhatsApp</button>
            </div>
          )}

          {/* In-app message */}
          {!isOwner && (!showMsgForm ? (
            <button onClick={() => { if (!user) { onAuthRequired(); return; } setShowMsgForm(true); }} className="w-full border-2 border-[#e5ddd8] rounded-xl py-3 text-[14px] font-semibold text-[#777] hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors mb-3">
              ✉️ Send in-app message
            </button>
          ) : msgSent ? (
            <div className="mb-3 bg-green-50 text-green-700 text-[14px] font-semibold text-center py-3 rounded-xl border border-green-200">✓ Message sent to seller!</div>
          ) : (
            <div className="mb-3">
              <textarea rows={3} value={msgBody} onChange={e => setMsgBody(e.target.value)} className="w-full bg-[#f5f0ed] border-2 border-transparent focus:border-[#d94f1e] rounded-xl p-3 text-sm outline-none resize-none transition-colors mb-2" />
              <button onClick={sendMessage} disabled={sendingMsg} className="w-full bg-[#1a1a1a] text-white rounded-xl py-3 text-[14px] font-bold disabled:opacity-60 hover:bg-[#333] transition-colors">
                {sendingMsg ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          ))}

          {/* Share */}
          <div className="flex items-center justify-between pt-4 border-t border-[#f0ebe6]">
            <span className="text-[12px] text-[#aaa] font-semibold">Share:</span>
            <div className="flex gap-2">
              {[['copy', '🔗 Copy'], ['whatsapp', 'WhatsApp'], ['facebook', 'Facebook']].map(([m, l]) => (
                <button key={m} onClick={() => share(m as any)} className="border border-[#e5ddd8] rounded-lg px-3 py-1.5 text-[11px] font-semibold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors">{l}</button>
              ))}
            </div>
          </div>

          {/* Report */}
          <div className="text-center mt-3">
            <button className="text-[11px] text-[#ccc] hover:text-[#999] transition-colors">⚠️ Report this listing</button>
          </div>
        </div>
      </div>
    </div>
  );
}
