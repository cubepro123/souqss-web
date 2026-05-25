import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/inbox")({
  component: Inbox,
  head: () => ({ meta: [{ title: "Inbox — SouqSS" }] }),
});

type Row = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listing: { title: string; images: string[] } | null;
  other: { display_name: string | null; avatar_url: string | null } | null;
  unread: number;
};

function Inbox() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id,listing_id,buyer_id,seller_id,last_message_at")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (!convs?.length) { setRows([]); setLoading(false); return; }

      const listingIds = [...new Set(convs.map(c => c.listing_id))];
      const otherIds = [...new Set(convs.map(c => c.buyer_id === user.id ? c.seller_id : c.buyer_id))];
      const convIds = convs.map(c => c.id);

      const [{ data: listings }, { data: profiles }, { data: msgs }] = await Promise.all([
        supabase.from("listings").select("id,title,images").in("id", listingIds),
        supabase.from("profiles").select("id,display_name,avatar_url").in("id", otherIds),
        supabase.from("messages").select("conversation_id,sender_id,read_at").in("conversation_id", convIds),
      ]);

      const lMap = new Map(listings?.map(l => [l.id, l]) ?? []);
      const pMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
      const unreadMap = new Map<string, number>();
      msgs?.forEach(m => {
        if (m.sender_id !== user.id && !m.read_at) {
          unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1);
        }
      });

      setRows(convs.map(c => ({
        ...c,
        listing: lMap.get(c.listing_id) ?? null,
        other: pMap.get(c.buyer_id === user.id ? c.seller_id : c.buyer_id) ?? null,
        unread: unreadMap.get(c.id) ?? 0,
      })));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <h1 className="ml-2 text-[16px] font-extrabold">Messages</h1>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">💬</div>
            <h2 className="text-[18px] font-extrabold mb-2">No messages yet</h2>
            <p className="text-muted-foreground text-[13px] mb-4">Start a chat from any listing.</p>
            <Link to="/browse" className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-[13.5px]">Browse listings</Link>
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border divide-y divide-border overflow-hidden">
            {rows.map(r => (
              <Link key={r.id} to="/inbox/$id" params={{ id: r.id }} className="flex items-center gap-3 p-4 hover:bg-muted/40 transition">
                <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center font-extrabold text-brand-dark shrink-0 overflow-hidden">
                  {r.other?.avatar_url ? <img src={r.other.avatar_url} className="w-full h-full object-cover" alt="" /> : (r.other?.display_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-[14px] truncate">{r.other?.display_name || "User"}</div>
                    {r.unread > 0 && <span className="text-[11px] font-bold bg-brand text-white rounded-full px-2 py-0.5">{r.unread}</span>}
                  </div>
                  <div className="text-[12.5px] text-muted-foreground truncate">{r.listing?.title || "Listing"}</div>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">{new Date(r.last_message_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
