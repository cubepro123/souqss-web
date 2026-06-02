import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  listing_id: string | null;
}

interface NotificationsBellProps {
  user: User | null;
  onOpenListing?: (id: string) => void;
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

const TYPE_ICON: Record<string, string> = {
  message: '💬', review: '⭐', save: '❤️', boost_expired: '⬆️',
};

export function NotificationsBell({ user, onOpenListing }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotes(prev => [payload.new as Notification, ...prev]);
        setUnread(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotes((data || []) as Notification[]);
    setUnread((data || []).filter((n: Notification) => !n.read).length);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user!.id).eq('read', false);
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id);
      setNotes(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (n.listing_id && onOpenListing) onOpenListing(n.listing_id);
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f0ed] transition-colors"
      >
        🔔
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-[#d94f1e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-[#e5ddd8] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ebe6]">
            <span className="font-bold text-[14px]">Notifications</span>
            {unread > 0 && <button onClick={markAllRead} className="text-[12px] text-[#d94f1e] font-semibold hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {notes.length === 0 ? (
              <div className="text-center py-10 text-[#aaa]">
                <div className="text-3xl mb-2">🔔</div>
                <div className="text-[13px] font-semibold">No notifications yet</div>
              </div>
            ) : notes.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-[#f5f0ed] last:border-0 hover:bg-[#fdf7f5] transition-colors ${!n.read ? 'bg-[#fff5f0]' : ''}`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold">{n.title}</div>
                  <div className="text-[12px] text-[#777] mt-0.5 leading-snug">{n.body}</div>
                  <div className="text-[11px] text-[#aaa] mt-1">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && <span className="w-2 h-2 bg-[#d94f1e] rounded-full flex-shrink-0 mt-1.5"></span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
