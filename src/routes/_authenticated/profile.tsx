import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Listing, Profile } from '@/lib/types';

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
  head: () => ({ meta: [{ title: 'My Profile — SouqSS' }] }),
});

const TABS = ['My Listings', 'Saved', 'Messages', 'Settings'] as const;
type Tab = typeof TABS[number];

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Message {
  id: string;
  body: string;
  read: boolean;
  created_at: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  listings?: { title: string; emoji: string };
  sender?: { full_name: string | null };
}

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('My Listings');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);

  // Settings form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifSaves, setNotifSaves] = useState(true);
  const [notifPriceDrops, setNotifPriceDrops] = useState(false);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [listingTab, setListingTab] = useState<'active' | 'sold'>('active');

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/' });
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user?.id]);

  const loadAll = async () => {
    setLoading(true);
    const [p, l, s, m] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
      supabase.from('listings').select('*').eq('user_id', user!.id).neq('status', 'deleted').order('created_at', { ascending: false }),
      supabase.from('saved_listings').select('listing_id, listings(*)').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('messages').select('*, listings(title, emoji), sender:profiles!messages_sender_id_fkey(full_name)').or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order('created_at', { ascending: false }),
    ]);
    const prof = p.data as Profile;
    setProfile(prof);
    setFullName(prof?.full_name || '');
    setPhone(prof?.phone || '');
    setLocation(prof?.location || '');
    setNotifMessages(prof?.notif_messages ?? true);
    setNotifSaves(prof?.notif_saves ?? true);
    setNotifPriceDrops(prof?.notif_price_drops ?? false);
    setNotifPromotions(prof?.notif_promotions ?? false);
    setMyListings((l.data || []) as Listing[]);
    setSavedListings(((s.data || []).map((r: any) => r.listings).filter(Boolean)) as Listing[]);
    setMessages((m.data || []) as Message[]);
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone, location }).eq('id', user!.id);
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const changePassword = async () => {
    setPwMsg('');
    if (newPassword.length < 6) { setPwMsg('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwMsg('Passwords do not match.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwMsg(error.message);
    else { setPwMsg('✓ Password updated!'); setNewPassword(''); setConfirmPassword(''); }
  };

  const markSold = async (id: string) => {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    setMyListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id);
    setMyListings(prev => prev.filter(l => l.id !== id));
  };

  const unsave = async (id: string) => {
    await supabase.from('saved_listings').delete().eq('user_id', user!.id).eq('listing_id', id);
    setSavedListings(prev => prev.filter(l => l.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };

  const inp = 'w-full bg-[#f5f0ed] border-2 border-transparent rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#d94f1e] transition-colors';
  const userInitial = (profile?.full_name || user?.email || '?').charAt(0).toUpperCase();
  const unreadCount = messages.filter(m => !m.read && m.receiver_id === user?.id).length;

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#f2ede9] flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="text-center text-[#aaa]">
        <div className="text-4xl mb-3 animate-spin">⏳</div>
        <div className="font-semibold">Loading profile…</div>
      </div>
    </div>
  );

  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');

  return (
    <div className="min-h-screen bg-[#f2ede9] pb-10" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-[#e5ddd8] sticky top-0 z-[200] shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 flex items-center gap-3 h-[60px]">
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center text-lg">🛍️</div>
            <span className="text-xl font-black">souq<span className="text-[#d94f1e]">SS</span></span>
          </button>
          <div className="flex-1" />
          <button onClick={() => navigate({ to: '/' })} className="text-[13px] font-semibold text-[#777] hover:text-[#1a1a1a] transition-colors">← Back to listings</button>
          <button onClick={signOut} className="text-[13px] font-semibold text-red-500 hover:text-red-700 transition-colors border border-red-200 rounded-lg px-3 py-1.5">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-4 py-6">

        {/* ── PROFILE HEADER ── */}
        <div className="bg-white rounded-2xl border border-[#e5ddd8] overflow-hidden mb-5 shadow-sm">
          <div className="h-24 bg-gradient-to-br from-[#1e4e1e] to-[#2d6e2d]" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-[#d94f1e] rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {userInitial}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {profile?.verified && <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-3 py-1 rounded-full">✓ Verified</span>}
                <span className="bg-[#f5f0ed] text-[#777] text-[11px] font-bold px-3 py-1 rounded-full">{profile?.rating ?? '5.0'} ★ ({profile?.review_count ?? 0} reviews)</span>
              </div>
            </div>
            <div className="text-xl font-extrabold">{profile?.full_name || 'Your Name'}</div>
            <div className="text-[13px] text-[#777] mt-0.5">{user?.email}</div>
            {profile?.location && <div className="text-[13px] text-[#777] mt-0.5">📍 {profile.location}</div>}
            {profile?.phone && <div className="text-[13px] text-[#777] mt-0.5">📞 {profile.phone}</div>}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#f0ebe6]">
              {[
                { label: 'Active Listings', value: activeListings.length, icon: '📋' },
                { label: 'Items Sold', value: soldListings.length, icon: '✅' },
                { label: 'Saved', value: savedListings.length, icon: '❤️' },
              ].map(s => (
                <div key={s.label} className="text-center bg-[#faf5f2] rounded-xl py-3">
                  <div className="text-lg mb-0.5">{s.icon}</div>
                  <div className="text-[20px] font-extrabold">{s.value}</div>
                  <div className="text-[11px] text-[#aaa] font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl border border-[#e5ddd8] overflow-hidden shadow-sm">
          <div className="flex border-b border-[#f0ebe6] overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 min-w-[100px] py-3.5 text-[13px] font-bold border-b-2 transition-colors whitespace-nowrap relative ${tab === t ? 'border-[#d94f1e] text-[#d94f1e]' : 'border-transparent text-[#999]'}`}
              >
                {t}
                {t === 'Messages' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-[#d94f1e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ── MY LISTINGS ── */}
            {tab === 'My Listings' && (
              <div>
                <div className="flex gap-2 mb-4">
                  {(['active', 'sold'] as const).map(t => (
                    <button key={t} onClick={() => setListingTab(t)} className={`px-4 py-2 rounded-full text-[12px] font-bold capitalize transition-colors ${listingTab === t ? 'bg-[#d94f1e] text-white' : 'bg-[#f5f0ed] text-[#777]'}`}>
                      {t} ({t === 'active' ? activeListings.length : soldListings.length})
                    </button>
                  ))}
                </div>
                {(listingTab === 'active' ? activeListings : soldListings).length === 0 ? (
                  <div className="text-center py-12 text-[#aaa]">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-semibold">No {listingTab} listings</div>
                    {listingTab === 'active' && <button onClick={() => navigate({ to: '/' })} className="mt-3 bg-[#d94f1e] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold">＋ Post an Ad</button>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(listingTab === 'active' ? activeListings : soldListings).map(L => (
                      <div key={L.id} className="flex items-center gap-3 bg-[#faf5f2] rounded-xl p-3.5 border border-[#f0ebe6]">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: bgMap[L.bg_color || 'bg-peach'] || '#fde8de' }}>{L.emoji || '🛒'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold truncate">{L.title}</div>
                          <div className="text-[#d94f1e] font-bold text-[13px]">{L.price_label}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-[#aaa]">👁 {L.views ?? 0} views</span>
                            <span className="text-[11px] text-[#aaa]">{timeAgo(L.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {L.status === 'active' && (
                            <button onClick={() => markSold(L.id)} className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-100 transition-colors">✓ Sold</button>
                          )}
                          <button onClick={() => deleteListing(L.id)} className="text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-100 transition-colors">🗑 Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SAVED ── */}
            {tab === 'Saved' && (
              savedListings.length === 0 ? (
                <div className="text-center py-12 text-[#aaa]">
                  <div className="text-4xl mb-3">🔖</div>
                  <div className="font-semibold">No saved listings yet</div>
                  <div className="text-[13px] mt-1">Tap 🔖 on any listing to save it</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedListings.map(L => (
                    <div key={L.id} className="flex items-center gap-3 bg-[#faf5f2] rounded-xl p-3.5 border border-[#f0ebe6]">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: bgMap[L.bg_color || 'bg-peach'] || '#fde8de' }}>{L.emoji || '🛒'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold truncate">{L.title}</div>
                        <div className="text-[#d94f1e] font-bold text-[13px]">{L.price_label}</div>
                        <div className="text-[11px] text-[#aaa] mt-0.5">📍 {L.location}</div>
                      </div>
                      <button onClick={() => unsave(L.id)} className="text-[#ccc] hover:text-red-500 transition-colors text-lg px-1">✕</button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── MESSAGES ── */}
            {tab === 'Messages' && (
              messages.length === 0 ? (
                <div className="text-center py-12 text-[#aaa]">
                  <div className="text-4xl mb-3">💬</div>
                  <div className="font-semibold">No messages yet</div>
                  <div className="text-[13px] mt-1">Messages from buyers will appear here</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map(m => {
                    const isSender = m.sender_id === user?.id;
                    const isUnread = !m.read && m.receiver_id === user?.id;
                    return (
                      <div key={m.id} className={`flex items-start gap-3 rounded-xl p-4 border transition-colors ${isUnread ? 'bg-[#fff5f0] border-[#fde8de]' : 'bg-[#faf5f2] border-[#f0ebe6]'}`}>
                        <div className="w-9 h-9 bg-[#d94f1e] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(m.sender?.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[13px] font-bold">{isSender ? 'You' : m.sender?.full_name || 'Buyer'}</span>
                            <span className="text-[11px] text-[#aaa] flex-shrink-0">{timeAgo(m.created_at)}</span>
                          </div>
                          <div className="text-[11px] text-[#aaa] mb-1">Re: {m.listings?.title || 'a listing'}</div>
                          <div className="text-[13px] text-[#555] leading-relaxed">{m.body}</div>
                        </div>
                        {isUnread && <div className="w-2 h-2 bg-[#d94f1e] rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── SETTINGS ── */}
            {tab === 'Settings' && (
              <div className="max-w-[500px] space-y-6">

                {/* Profile info */}
                <div>
                  <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2">👤 Profile Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Full Name</label>
                      <input className={inp} type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Email</label>
                      <input className={inp + ' opacity-60 cursor-not-allowed'} type="email" value={user?.email || ''} disabled />
                      <p className="text-[11px] text-[#aaa] mt-1">Email cannot be changed here for security reasons.</p>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Phone Number</label>
                      <input className={inp} type="tel" placeholder="+211912345678" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Location</label>
                      <input className={inp} type="text" placeholder="e.g. Juba, Hai Amarat" value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <button onClick={saveProfile} disabled={saving} className="bg-[#d94f1e] text-white rounded-xl px-6 py-3 text-[14px] font-bold disabled:opacity-60 hover:bg-[#c04418] transition-colors">
                      {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[#f0ebe6]" />

                {/* Change password */}
                <div>
                  <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2">🔒 Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">New Password</label>
                      <input className={inp} type="password" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Confirm New Password</label>
                      <input className={inp} type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    {pwMsg && <p className={`text-[13px] font-semibold px-3 py-2 rounded-lg ${pwMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{pwMsg}</p>}
                    <button onClick={changePassword} className="bg-[#1a1a1a] text-white rounded-xl px-6 py-3 text-[14px] font-bold hover:bg-[#333] transition-colors">Update Password</button>
                  </div>
                </div>

                <div className="h-px bg-[#f0ebe6]" />

                {/* Notifications prefs */}
                <div>
                  <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2">🔔 Notification Preferences</h3>
                  <div className="space-y-3">
                    {([
                      { key: 'messages', label: 'Messages', desc: 'Get notified when someone messages you', val: notifMessages, set: setNotifMessages },
                      { key: 'saves', label: 'Listing saves', desc: 'Get notified when someone saves your listing', val: notifSaves, set: setNotifSaves },
                      { key: 'price_drops', label: 'Price drops', desc: 'Get notified on saved listings with price drops', val: notifPriceDrops, set: setNotifPriceDrops },
                      { key: 'promotions', label: 'Promotions', desc: 'Receive SouqSS news and offers', val: notifPromotions, set: setNotifPromotions },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-[13px] font-semibold">{item.label}</div>
                          <div className="text-[12px] text-[#aaa]">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => item.set(!item.val)}
                          className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${item.val ? 'bg-[#d94f1e]' : 'bg-[#ddd]'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${item.val ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  {notifSaved && <div className="text-[12px] text-green-600 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-200">✓ Preferences saved!</div>}
                  <button onClick={async () => {
                    await supabase.from('profiles').update({ notif_messages: notifMessages, notif_saves: notifSaves, notif_price_drops: notifPriceDrops, notif_promotions: notifPromotions }).eq('id', user!.id);
                    setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000);
                  }} className="bg-[#d94f1e] text-white rounded-xl px-5 py-2.5 text-[13px] font-bold hover:bg-[#c04418] transition-colors">Save Preferences</button>
                  </div>
                </div>

                <div className="h-px bg-[#f0ebe6]" />

                {/* Danger zone */}
                <div>
                  <h3 className="text-[15px] font-extrabold mb-4 text-red-600 flex items-center gap-2">⚠️ Account</h3>
                  <div className="space-y-3">
                    <button onClick={signOut} className="w-full border-2 border-red-200 text-red-600 rounded-xl py-3 text-[14px] font-bold hover:bg-red-50 transition-colors">Sign Out</button>
                    <button onClick={() => confirm('Are you sure? This cannot be undone.') && alert('Please contact support@souqss.tech to delete your account.')} className="w-full text-[13px] text-[#ccc] hover:text-red-400 transition-colors py-1">Delete my account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
