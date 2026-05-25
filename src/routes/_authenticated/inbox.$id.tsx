import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/inbox/$id")({
  component: Thread,
  head: () => ({ meta: [{ title: "Chat — SouqSS" }] }),
});

type Msg = { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };
type Conv = { id: string; listing_id: string; buyer_id: string; seller_id: string };

function Thread() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conv, setConv] = useState<Conv | null>(null);
  const [listing, setListing] = useState<{ id: string; title: string; images: string[]; price: number | null; currency: string } | null>(null);
  const [other, setOther] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conv + listing + other + messages
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
      if (!c) { navigate({ to: "/inbox" }); return; }
      setConv(c);
      const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
      const [{ data: l }, { data: p }, { data: m }] = await Promise.all([
        supabase.from("listings").select("id,title,images,price,currency").eq("id", c.listing_id).maybeSingle(),
        supabase.from("profiles").select("display_name,avatar_url").eq("id", otherId).maybeSingle(),
        supabase.from("messages").select("*").eq("conversation_id", id).order("created_at"),
      ]);
      setListing(l);
      setOther(p);
      setMsgs(m ?? []);
      // mark incoming as read
      await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", id).neq("sender_id", user.id).is("read_at", null);
    })();
  }, [id, user, navigate]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`messages:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, async (payload) => {
        const m = payload.new as Msg;
        setMsgs(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        if (m.sender_id !== user.id) {
          await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", m.id);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !conv || sending) return;
    setSending(true);
    const body = text.trim().slice(0, 4000);
    setText("");
    const { data, error } = await supabase.from("messages").insert({
      conversation_id: id, sender_id: user.id, body,
    }).select().single();
    if (!error && data) setMsgs(prev => prev.some(x => x.id === data.id) ? prev : [...prev, data]);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[800px] mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/inbox" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground">←</Link>
          <Link to="/" className="hidden sm:flex items-center gap-2">
            <img src={logo} alt="SouqSS" className="w-8 h-8 rounded-xl" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center font-extrabold text-brand-dark overflow-hidden">
            {other?.avatar_url ? <img src={other.avatar_url} className="w-full h-full object-cover" alt="" /> : (other?.display_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[14px] truncate">{other?.display_name || "User"}</div>
            {listing && <Link to="/listings/$id" params={{ id: listing.id }} className="text-[12px] text-brand truncate block">{listing.title}</Link>}
          </div>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-4 space-y-2">
          {listing && (
            <Link to="/listings/$id" params={{ id: listing.id }} className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3 mb-4">
              <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                {listing.images?.[0] && <img src={listing.images[0]} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[13px] truncate">{listing.title}</div>
                <div className="text-price font-extrabold text-[14px]">{listing.currency} {listing.price?.toLocaleString() ?? "—"}</div>
              </div>
            </Link>
          )}
          {msgs.map(m => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[14px] ${mine ? "bg-brand text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
          {msgs.length === 0 && <div className="text-center text-muted-foreground text-[13px] py-10">Say hi 👋</div>}
        </div>
      </main>

      <form onSubmit={send} className="bg-card border-t border-border sticky bottom-0">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={4000}
            className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-[14px] focus:outline-none focus:border-brand"
          />
          <button type="submit" disabled={!text.trim() || sending} className="h-11 px-5 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-[13.5px] disabled:opacity-50">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
