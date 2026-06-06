import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Listing, Profile } from '@/lib/types';

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
  head: () => ({ meta: [{ title: 'My Profile — SouqSS' }] }),
});

interface Message {
  id: string; body: string; read: boolean; created_at: string;
  listing_id: string; sender_id: string; receiver_id: string;
  listings?: { title: string; emoji: string };
  sender?: { full_name: string | null };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ROW = ({ icon, iconBg, label, sub, onClick, right }: { icon: string; iconBg: string; label: string; sub?: string; onClick?: () => void; right?: React.ReactNode }) => (
  <div onClick={onClick} className={`flex items-center gap-3.5 px-4 py-3.5 border-b border-[#1e1e1e] last:border-0 ${onClick ? 'cursor-pointer active:bg-[#1a1a1a]' : ''}`}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#f0f0f0' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#666', marginTop: 1 }}>{sub}</div>}
    </div>
    {right || (onClick && <span style={{ color: '#444', fontSize: 18 }}>›</span>)}
  </div>
);

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', padding: '0 20px', marginBottom: 8 }}>{title}</div>
    <div style={{ background: '#161616', borderRadius: 16, overflow: 'hidden', margin: '0 16px', border: '1px solid #1e1e1e' }}>{children}</div>
  </div>
);

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<string | null>(null);

  // Edit profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Password
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Notif prefs
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifSaves, setNotifSaves] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  // Dark mode (local)
  const [darkMode, setDarkMode] = useState(true);

  // Listing tabs
  const [listingTab, setListingTab] = useState<'active'|'sold'>('active');

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/' });
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('listings').select('*').eq('user_id', user.id).neq('status','deleted').order('created_at',{ascending:false}),
      supabase.from('saved_listings').select('listing_id, listings(*)').eq('user_id', user.id).order('created_at',{ascending:false}),
      supabase.from('messages').select('*, listings(title,emoji), sender:profiles!messages_sender_id_fkey(full_name)').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at',{ascending:false}),
    ]).then(([p, l, s, m]) => {
      const prof = p.data as Profile;
      setProfile(prof);
      setFullName(prof?.full_name || '');
      setPhone(prof?.phone || '');
      setLocation(prof?.location || '');
      setNotifMessages((prof as any)?.notif_messages ?? true);
      setNotifSaves((prof as any)?.notif_saves ?? true);
      setMyListings((l.data || []) as Listing[]);
      setSavedListings(((s.data||[]).map((r:any) => r.listings).filter(Boolean)) as Listing[]);
      setMessages((m.data||[]) as Message[]);
      setLoading(false);
    });
  }, [user?.id]);

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone, location }).eq('id', user!.id);
    setSaving(false); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000);
  };

  const changePw = async () => {
    setPwMsg('');
    if (newPw.length < 6) { setPwMsg('Min 6 characters'); return; }
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) setPwMsg(error.message);
    else { setPwMsg('✓ Password updated!'); setNewPw(''); setConfirmPw(''); }
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

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: '/' }); };

  const inp = 'w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#E8440A] transition-colors';

  const userInitial = (profile?.full_name || user?.email || '?').slice(0, 2).toUpperCase();
  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');
  const unread = messages.filter(m => !m.read && m.receiver_id === user?.id).length;

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>Loading…</div>
    </div>
  );

  const bgMap: Record<string,string> = { 'bg-peach':'#fde8de','bg-sky':'#ddeef8','bg-mint':'#ddf0e8','bg-lav':'#ede8f5','bg-sun':'#fef3d8','bg-rose':'#fde8e8','bg-sage':'#e8f0e8','bg-cream':'#f5f0e8','bg-steel':'#e8edf5' };

  // ── SUB-SECTION VIEWS ──
  if (section === 'listings') return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0f0f0', fontFamily: 'Plus Jakarta Sans, sans-serif', paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
        <button onClick={() => setSection(null)} style={{ background: '#1e1e1e', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>My Listings</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        {(['active','sold'] as const).map(t => (
          <button key={t} onClick={() => setListingTab(t)} style={{ padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: listingTab === t ? '#E8440A' : '#1e1e1e', color: listingTab === t ? '#fff' : '#888', fontFamily: 'inherit' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'active' ? activeListings.length : soldListings.length})
          </button>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        {(listingTab === 'active' ? activeListings : soldListings).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600 }}>No {listingTab} listings</div>
            {listingTab === 'active' && <button onClick={() => navigate({ to: '/post-ad' })} style={{ marginTop: 16, background: '#E8440A', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>＋ Post an Ad</button>}
          </div>
        ) : (listingTab === 'active' ? activeListings : soldListings).map(L => (
          <div key={L.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#161616', borderRadius: 14, padding: 12, marginBottom: 10, border: '1px solid #1e1e1e' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: bgMap[L.bg_color||'bg-peach']||'#fde8de' }}>{L.emoji||'🛒'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.title}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8440A', marginTop: 2 }}>{L.price_label}</div>
              <div style={{ fontSize: 11.5, color: '#555', marginTop: 1 }}>👁 {L.views??0} · {timeAgo(L.created_at)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {L.status === 'active' && <button onClick={() => markSold(L.id)} style={{ fontSize: 11, background: '#1a2e1a', color: '#4caf50', border: '1px solid #2a4a2a', borderRadius: 8, padding: '5px 10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Sold</button>}
              <button onClick={() => deleteListing(L.id)} style={{ fontSize: 11, background: '#2e1a1a', color: '#e57373', border: '1px solid #4a2a2a', borderRadius: 8, padding: '5px 10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (section === 'saved') return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0f0f0', fontFamily: 'Plus Jakarta Sans, sans-serif', paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
        <button onClick={() => setSection(null)} style={{ background: '#1e1e1e', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Saved Ads</h2>
      </div>
      <div style={{ padding: 16 }}>
        {savedListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
            <div style={{ fontWeight: 600 }}>No saved listings</div>
          </div>
        ) : savedListings.map(L => (
          <div key={L.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#161616', borderRadius: 14, padding: 12, marginBottom: 10, border: '1px solid #1e1e1e' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: bgMap[L.bg_color||'bg-peach']||'#fde8de' }}>{L.emoji||'🛒'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.title}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8440A', marginTop: 2 }}>{L.price_label}</div>
              <div style={{ fontSize: 11.5, color: '#555', marginTop: 1 }}>📍 {L.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (section === 'messages') return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0f0f0', fontFamily: 'Plus Jakarta Sans, sans-serif', paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
        <button onClick={() => setSection(null)} style={{ background: '#1e1e1e', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Messages</h2>
      </div>
      <div style={{ padding: 16 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 600 }}>No messages yet</div>
          </div>
        ) : messages.map(m => {
          const isSender = m.sender_id === user?.id;
          const isUnread = !m.read && m.receiver_id === user?.id;
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: isUnread ? '#1a1410' : '#161616', borderRadius: 14, padding: 14, marginBottom: 10, border: `1px solid ${isUnread ? '#3a2a1a' : '#1e1e1e'}` }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8440A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {(m.sender?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#f0f0f0' }}>{isSender ? 'You' : m.sender?.full_name || 'Buyer'}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{timeAgo(m.created_at)}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#666', marginBottom: 4 }}>Re: {m.listings?.title || 'a listing'}</div>
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{m.body}</div>
              </div>
              {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8440A', flexShrink: 0, marginTop: 6 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (section === 'edit') return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0f0f0', fontFamily: 'Plus Jakarta Sans, sans-serif', paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1e1e1e' }}>
        <button onClick={() => setSection(null)} style={{ background: '#1e1e1e', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Edit Profile</h2>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: '#E8440A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff' }}>{userInitial}</div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Full Name', value: fullName, set: setFullName, type: 'text', placeholder: 'Your full name' },
            { label: 'Phone', value: phone, set: setPhone, type: 'tel', placeholder: '+211912345678' },
            { label: 'Location', value: location, set: setLocation, type: 'text', placeholder: 'e.g. Juba, Hai Amarat' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input className={inp} type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Email</label>
            <input className={inp + ' opacity-50 cursor-not-allowed'} type="email" value={user?.email || ''} disabled />
          </div>
          {savedMsg && <div style={{ background: '#1a2e1a', border: '1px solid #2a4a2a', color: '#4caf50', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>✓ Profile saved!</div>}
          <button onClick={saveProfile} disabled={saving} style={{ width: '100%', background: '#E8440A', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#555', marginBottom: 14 }}>Change Password</div>
          <div className="space-y-3">
            <input className={inp} type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <input className={inp} type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            {pwMsg && <div style={{ fontSize: 13, fontWeight: 600, color: pwMsg.startsWith('✓') ? '#4caf50' : '#e57373', background: pwMsg.startsWith('✓') ? '#1a2e1a' : '#2e1a1a', padding: '10px 14px', borderRadius: 10 }}>{pwMsg}</div>}
            <button onClick={changePw} style={{ width: '100%', background: '#1e1e1e', color: '#f0f0f0', border: '1px solid #2a2a2a', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN PROFILE VIEW ──
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0f0f0', fontFamily: 'Plus Jakarta Sans, sans-serif', paddingBottom: 100 }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0' }}>My Profile</h1>
        <button onClick={() => setSection('edit')} style={{ width: 38, height: 38, borderRadius: 10, background: '#1e1e1e', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer', color: '#888' }}>⚙️</button>
      </div>

      {/* Premium upgrade banner */}
      <div style={{ margin: '0 16px 20px', background: 'linear-gradient(135deg,#2a1f0a,#1e1608)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #3a2e10' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⭐</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd460' }}>Upgrade to Premium</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>Unlimited ads, 10 photos, verified badge & more — SSP 15,000/mo</div>
          </div>
        </div>
        <button onClick={() => setSection('premium')} style={{ background: 'none', border: 'none', color: '#ffd460', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Upgrade →</button>
      </div>

      {/* Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', marginBottom: 20 }}>
        <div style={{ width: 68, height: 68, borderRadius: 18, background: '#E8440A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{userInitial}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0' }}>{profile?.full_name || 'Your Name'}</div>
          {profile?.location && <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>📍 {profile.location}</div>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#1e1e1e', border: '1px solid #333', borderRadius: 20, padding: '3px 10px', marginTop: 6 }}>
            <span style={{ fontSize: 12 }}>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>Basic Account</span>
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 5 }}>Free plan · <span style={{ color: '#E8440A', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSection('premium')}>Upgrade ↑</span></div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', margin: '0 16px 24px', background: '#161616', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
        {[
          { label: 'Ads Posted', value: activeListings.length },
          { label: 'Saved', value: savedListings.length },
          { label: 'Reviews', value: profile?.review_count ?? 0 },
        ].map((s, i) => (
          <div key={s.label} style={{ textAlign: 'center', padding: '16px 8px', borderRight: i < 2 ? '1px solid #1e1e1e' : undefined }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#E8440A' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: '#555', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Business */}
      <SECTION title="Business">
        <ROW icon="🏪" iconBg="#1a1e2e" label="Register Business" sub="Create a shop page and start selling" onClick={() => {}} />
      </SECTION>

      {/* My Activity */}
      <SECTION title="My Activity">
        <ROW icon="📋" iconBg="#2e1a1a" label="My Listings" sub={`${activeListings.length} active ads`} onClick={() => setSection('listings')} />
        <ROW icon="🔖" iconBg="#1a1e2e" label="Saved Ads" sub={`${savedListings.length} saved`} onClick={() => setSection('saved')} />
        <ROW icon="💬" iconBg="#1e2a1e" label="Messages" sub="Chat inbox" onClick={() => setSection('messages')}
          right={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unread > 0 && <span style={{ background: '#E8440A', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
            <span style={{ color: '#444', fontSize: 18 }}>›</span>
          </div>}
        />
      </SECTION>

      {/* Get verified */}
      <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg,#0d1a2e,#0a1020)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #1a2a3a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🪪</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>Get Verified</div>
            <div style={{ fontSize: 12, color: '#555' }}>Upload your National ID to get the Verified badge</div>
          </div>
        </div>
        <button style={{ background: '#60a5fa', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Verify</button>
      </div>

      {/* Account */}
      <SECTION title="Account">
        <ROW icon="👤" iconBg="#2e1a1a" label="Edit Profile" sub="Name, phone, photo, bio" onClick={() => setSection('edit')} />
        <ROW icon="🛡️" iconBg="#1e2e1e" label="Verification" sub={profile?.verified ? 'Verified ✓' : 'Not verified'} onClick={() => {}} />
      </SECTION>

      {/* Preferences */}
      <SECTION title="Preferences">
        <ROW icon="🌙" iconBg="#1a1a2e" label="Dark Mode" sub="Easy on the eyes at night"
          right={
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: 48, height: 26, borderRadius: 13, background: darkMode ? '#E8440A' : '#333', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: darkMode ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }} />
            </button>
          }
        />
        <ROW icon="🔔" iconBg="#2e1e1a" label="Notifications" sub="Push alerts for messages"
          right={
            <button onClick={async () => { const v = !notifMessages; setNotifMessages(v); await supabase.from('profiles').update({ notif_messages: v }).eq('id', user!.id); }} style={{ width: 48, height: 26, borderRadius: 13, background: notifMessages ? '#E8440A' : '#333', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifMessages ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }} />
            </button>
          }
        />
      </SECTION>

      {/* Premium */}
      <SECTION title="Premium">
        <ROW icon="⭐" iconBg="#2a1f0a" label="SouqSS Premium" sub="Upgrade for SSP 15,000/mo" onClick={() => setSection('premium')}
          right={<span style={{ color: '#ffd460', fontSize: 18 }}>›</span>}
        />
      </SECTION>

      {/* Data */}
      <SECTION title="Data">
        <ROW icon="🔄" iconBg="#1a1e2e" label="Refresh Feed" sub="Pull latest from Supabase" onClick={() => { window.location.reload(); }} />
        <ROW icon="🚪" iconBg="#2e1a1a" label="Sign Out" sub="Log out of your account" onClick={signOut} />
      </SECTION>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px', color: '#333', fontSize: 12.5 }}>
        <div>SouqSS v2.1 — Made in Juba 🇸🇸</div>
        <div style={{ marginTop: 4 }}>Powered by Supabase</div>
      </div>
    </div>
  );
}
