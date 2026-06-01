import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface PostAdModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const CATS = [
  { label: 'Electronics', emoji: '📱', bg: 'bg-peach' },
  { label: 'Vehicles', emoji: '🚗', bg: 'bg-sky' },
  { label: 'Real Estate', emoji: '🏠', bg: 'bg-mint' },
  { label: 'Fashion', emoji: '👗', bg: 'bg-rose' },
  { label: 'Home & Furniture', emoji: '🛋️', bg: 'bg-cream' },
  { label: 'Food & Groceries', emoji: '🥭', bg: 'bg-sage' },
  { label: 'Industrial', emoji: '⚙️', bg: 'bg-lav' },
  { label: 'Services', emoji: '🔧', bg: 'bg-steel' },
];

const CONDITIONS = ['Brand New', 'Like New', 'Used', 'For Parts', 'Fresh', 'Made-to-order'];

export function PostAdModal({ open, onClose, user, onSuccess }: PostAdModalProps) {
  const [selectedCat, setSelectedCat] = useState<typeof CATS[0] | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [cond, setCond] = useState('Brand New');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open || !user) return null;

  const reset = () => {
    setSelectedCat(null); setTitle(''); setDesc(''); setPrice('');
    setCond('Brand New'); setLocation(''); setPhone(''); setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const submit = async () => {
    if (!selectedCat || !title || !desc || !price || !location) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError('');
    const numPrice = parseFloat(price);
    const { error: err } = await supabase.from('listings').insert({
      user_id: user.id,
      title: title.trim(),
      description: desc.trim(),
      price: numPrice,
      price_label: 'SSP ' + numPrice.toLocaleString(),
      category: selectedCat.label,
      condition: cond,
      location: location.trim(),
      emoji: selectedCat.emoji,
      bg_color: selectedCat.bg,
      phone: phone.trim() || null,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    reset();
    onClose();
    onSuccess();
  };

  const inputCls = 'w-full bg-[#f5f0ed] border-2 border-transparent rounded-[10px] px-3.5 py-3 text-sm outline-none focus:border-[#d94f1e] transition-colors';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-6 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-extrabold">Post an Ad</h3>
            <button onClick={handleClose} className="text-2xl text-[#aaa] hover:text-[#1a1a1a] leading-none">×</button>
          </div>
          <p className="text-[13px] text-[#777] mb-5">Pick a category then fill in your listing details.</p>

          {/* Category grid */}
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {CATS.map(cat => (
              <button
                key={cat.label}
                onClick={() => setSelectedCat(cat)}
                className={`rounded-xl border-2 p-3 text-center transition-all ${selectedCat?.label === cat.label ? 'border-[#d94f1e] bg-[#fff5f0]' : 'border-[#e5ddd8] hover:border-[#d94f1e]'}`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="text-[11px] font-semibold text-[#1a1a1a]">{cat.label}</div>
              </button>
            ))}
          </div>

          {/* Form */}
          {selectedCat && (
            <>
              <div className="h-px bg-[#f0ebe6] mb-5" />
              <div className="space-y-3.5">
                <div>
                  <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Ad Title *</label>
                  <input className={inputCls} type="text" placeholder="e.g. iPhone 14 Pro Max 256GB — sealed box" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Description *</label>
                  <textarea className={inputCls + ' resize-y'} rows={4} placeholder="Describe your item — condition, age, specs, why you are selling..." value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Price (SSP) *</label>
                    <input className={inputCls} type="number" placeholder="e.g. 250000" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Condition *</label>
                    <select className={inputCls + ' cursor-pointer'} value={cond} onChange={e => setCond(e.target.value)}>
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Location *</label>
                  <input className={inputCls} type="text" placeholder="e.g. Juba, Hai Amarat" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-1.5">Contact Phone</label>
                  <input className={inputCls} type="tel" placeholder="+211912345678" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                {error && <p className="text-[13px] text-red-600 font-semibold">{error}</p>}

                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full bg-[#d94f1e] text-white rounded-xl py-3.5 text-[15px] font-bold disabled:opacity-70 hover:bg-[#c04418] transition-colors"
                >{loading ? 'Posting…' : '🚀 Post Ad — Go Live Now'}</button>
                <button onClick={handleClose} className="w-full text-[13px] text-[#999] py-2">Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
