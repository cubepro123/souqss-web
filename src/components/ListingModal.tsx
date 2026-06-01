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
}

export function ListingModal({ listing: L, onClose, onAuthRequired, user, savedIds, onToggleSave }: ListingModalProps) {
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);

  useEffect(() => {
    if (L) {
      setMsgBody(`Hi! I'm interested in your listing "${L.title}". Is it still available?`);
      setMsgSent(false);
      setShowMsgForm(false);
      // increment views
      supabase.rpc('increment_views', { p_listing_id: L.id }).then(() => {});
    }
  }, [L?.id]);

  if (!L) return null;

  const p = L.profiles;
  const memberDate = p?.member_since
    ? new Date(p.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Longtime member';

  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };
  const heroBg = bgMap[L.bg_color || 'bg-peach'] || '#fde8de';
  const saved = savedIds.has(L.id);

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
    await supabase.from('messages').insert({
      listing_id: L.id,
      sender_id: user.id,
      receiver_id: L.user_id,
      body: msgBody,
    });
    setSendingMsg(false);
    setMsgSent(true);
  };

  const share = (method: 'copy' | 'whatsapp' | 'facebook') => {
    const url = window.location.href;
    const text = `Check this out on SouqSS: ${L.title} — ${L.price_label}`;
    if (method === 'copy') navigator.clipboard.writeText(url);
    else if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[600] flex items-start justify-center p-6 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[700px] my-auto overflow-hidden shadow-2xl">
        {/* Hero */}
        <div className="h-[260px] flex items-center justify-center relative" style={{ background: heroBg }}>
          <button onClick={onClose} className="absolute top-3.5 right-3.5 bg-white/90 rounded-full w-9 h-9 text-lg shadow-md hover:bg-white transition-colors flex items-center justify-center">×</button>
          <button
            onClick={() => onToggleSave(L.id)}
            className="absolute top-3.5 left-3.5 bg-white/90 rounded-full w-9 h-9 shadow-md hover:bg-white transition-colors flex items-center justify-center text-base"
          >{saved ? '❤️' : '🔖'}</button>
          <span className="text-[100px] drop-shadow-md">{L.emoji || '🛒'}</span>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-[26px] font-black text-[#d94f1e]">{L.price_label}</div>
          <div className="text-[18px] font-bold mt-2 mb-4 leading-snug">{L.title}</div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              `📍 ${L.location}`,
              `🏷️ ${L.condition}`,
              `📂 ${L.category}`,
              `👁 ${(L.views ?? 0) + 1} views`,
            ].map(tag => (
              <span key={tag} className="bg-[#f5f0ed] rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-[#777]">{tag}</span>
            ))}
          </div>

          {/* Description */}
          <p className="text-[14px] text-[#555] leading-relaxed border-t border-[#f0ebe6] pt-5 mb-6">{L.description}</p>

          {/* Seller */}
          <div className="flex items-center gap-3.5 bg-[#f9f5f2] rounded-2xl p-4 mb-5">
            <div className="w-12 h-12 bg-[#d94f1e] rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
              {(p?.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[15px]">{p?.full_name || 'SouqSS Seller'}</div>
              <div className="text-[12px] text-[#777] mt-0.5">Member since {memberDate}</div>
              <div className="text-[13px] text-[#d94f1e] font-bold mt-0.5">{p?.rating ?? '5.0'} ★ ({p?.review_count ?? 0} reviews)</div>
            </div>
            {p?.verified && (
              <span className="text-[11px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-bold">✓ Verified</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => contactSeller('call')}
              className="bg-[#25D366] text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#1da851] transition-colors"
            >📞 Call Seller</button>
            <button
              onClick={() => contactSeller('whatsapp')}
              className="bg-[#d94f1e] text-white rounded-xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#c04418] transition-colors"
            >💬 WhatsApp</button>
          </div>

          {/* In-app message */}
          {!showMsgForm ? (
            <button
              onClick={() => { if (!user) { onAuthRequired(); return; } setShowMsgForm(true); }}
              className="w-full mt-3 border-2 border-[#e5ddd8] rounded-xl py-3 text-[14px] font-semibold text-[#777] hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors"
            >✉️ Send in-app message</button>
          ) : msgSent ? (
            <div className="mt-3 bg-green-50 text-green-700 text-[14px] font-semibold text-center py-3 rounded-xl border border-green-200">✓ Message sent to seller!</div>
          ) : (
            <div className="mt-3">
              <textarea
                rows={3}
                value={msgBody}
                onChange={e => setMsgBody(e.target.value)}
                className="w-full bg-[#f5f0ed] border-2 border-transparent focus:border-[#d94f1e] rounded-xl p-3 text-sm outline-none resize-none transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={sendingMsg}
                className="w-full mt-2 bg-[#1a1a1a] text-white rounded-xl py-3 text-[14px] font-bold disabled:opacity-60 hover:bg-[#333] transition-colors"
              >{sendingMsg ? 'Sending…' : 'Send Message'}</button>
            </div>
          )}

          {/* Share */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0ebe6]">
            <span className="text-[12px] text-[#aaa] font-semibold">Share:</span>
            <div className="flex gap-2">
              {[['copy', '🔗 Copy Link'], ['whatsapp', 'WhatsApp'], ['facebook', 'Facebook']].map(([method, label]) => (
                <button
                  key={method}
                  onClick={() => share(method as any)}
                  className="border-[1.5px] border-[#e5ddd8] rounded-[9px] px-3.5 py-1.5 text-[12px] font-semibold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors"
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
