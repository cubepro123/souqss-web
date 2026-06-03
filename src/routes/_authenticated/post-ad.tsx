import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/_authenticated/post-ad')({
  component: PostAdPage,
  head: () => ({ meta: [{ title: 'Post an Ad — SouqSS' }] }),
});

const CATS = [
  { label: 'Vehicles', emoji: '🚗', bg: 'bg-sky', subs: [
    { name: 'Cars', icon: '🚗' },
    { name: 'Motorcycles & Boda Boda', icon: '🏍️' },
    { name: 'Trucks & Lorries', icon: '🚛' },
    { name: 'Water Trucks', icon: '🚰' },
    { name: 'Buses & Minibuses', icon: '🚌' },
    { name: 'Pickup Trucks', icon: '🛻' },
    { name: 'Tuk Tuks', icon: '🛺' },
    { name: 'Tractors & Farm Equipment', icon: '🚜' },
    { name: 'Boats & Canoes', icon: '⛵' },
    { name: 'Spare Parts & Accessories', icon: '🔩' },
    { name: 'Other Vehicles', icon: '🚙' },
  ]},
  { label: 'Electronics', emoji: '📱', bg: 'bg-peach', subs: [
    { name: 'Mobile Phones', icon: '📱' },
    { name: 'Laptops & Computers', icon: '💻' },
    { name: 'TVs & Screens', icon: '📺' },
    { name: 'Audio & Speakers', icon: '🔊' },
    { name: 'Cameras & Photography', icon: '📷' },
    { name: 'Gaming', icon: '🎮' },
    { name: 'Solar & Power Banks', icon: '☀️' },
    { name: 'Printers & Scanners', icon: '🖨️' },
    { name: 'Accessories & Cables', icon: '🔌' },
    { name: 'Other Electronics', icon: '📡' },
  ]},
  { label: 'Real Estate', emoji: '🏠', bg: 'bg-mint', subs: [
    { name: 'Houses for Rent', icon: '🏠' },
    { name: 'Houses for Sale', icon: '🏡' },
    { name: 'Apartments & Flats', icon: '🏢' },
    { name: 'Land & Plots', icon: '🌍' },
    { name: 'Commercial Property', icon: '🏪' },
    { name: 'Office Space', icon: '🏬' },
    { name: 'Short Stay / Guest House', icon: '🛏️' },
    { name: 'Warehouse & Storage', icon: '🏭' },
  ]},
  { label: 'Pets', emoji: '🐾', bg: 'bg-sage', subs: [
    { name: 'Dogs', icon: '🐕' },
    { name: 'Cats', icon: '🐈' },
    { name: 'Chickens & Poultry', icon: '🐔' },
    { name: 'Goats & Sheep', icon: '🐐' },
    { name: 'Cattle & Cows', icon: '🐄' },
    { name: 'Birds', icon: '🦜' },
    { name: 'Fish & Aquarium', icon: '🐠' },
    { name: 'Pet Food & Supplies', icon: '🦴' },
    { name: 'Veterinary Services', icon: '💉' },
    { name: 'Other Animals', icon: '🐾' },
  ]},
  { label: 'Fashion', emoji: '👗', bg: 'bg-rose', subs: [
    { name: "Women's Clothing", icon: '👗' },
    { name: "Men's Clothing", icon: '👔' },
    { name: 'Shoes & Sandals', icon: '👟' },
    { name: 'Bags & Handbags', icon: '👜' },
    { name: 'Watches & Jewellery', icon: '⌚' },
    { name: 'Traditional Wear', icon: '👘' },
    { name: 'Sunglasses & Accessories', icon: '🕶️' },
    { name: "Kids' Clothing", icon: '🧒' },
    { name: 'Second-hand / Mitumba', icon: '♻️' },
  ]},
  { label: 'Home & Furniture', emoji: '🛋️', bg: 'bg-cream', subs: [
    { name: 'Sofas & Chairs', icon: '🛋️' },
    { name: 'Beds & Mattresses', icon: '🛏️' },
    { name: 'Dining Tables & Sets', icon: '🍽️' },
    { name: 'Kitchen Items & Cookware', icon: '🍳' },
    { name: 'Home Appliances', icon: '🧺' },
    { name: 'Home Décor', icon: '🖼️' },
    { name: 'Curtains & Rugs', icon: '🏮' },
    { name: 'Garden & Outdoor', icon: '🌿' },
    { name: 'Office Furniture', icon: '🪑' },
  ]},
  { label: 'Food & Groceries', emoji: '🥭', bg: 'bg-sage', subs: [
    { name: 'Fresh Fruits & Vegetables', icon: '🥦' },
    { name: 'Grains & Cereals', icon: '🌾' },
    { name: 'Meat & Fish', icon: '🥩' },
    { name: 'Beverages & Drinks', icon: '🥤' },
    { name: 'Packaged & Canned Foods', icon: '🥫' },
    { name: 'Farm Products', icon: '🌽' },
    { name: 'Cooking Oil & Spices', icon: '🧂' },
    { name: 'Bakery & Snacks', icon: '🍞' },
  ]},
  { label: 'Services', emoji: '🔧', bg: 'bg-steel', subs: [
    { name: 'Car Repair & Mechanics', icon: '🔧' },
    { name: 'Construction & Building', icon: '🏗️' },
    { name: 'Cleaning Services', icon: '🧹' },
    { name: 'Transport & Delivery', icon: '🚚' },
    { name: 'IT & Tech Support', icon: '💻' },
    { name: 'Tailoring & Fashion', icon: '✂️' },
    { name: 'Catering & Cooking', icon: '👨‍🍳' },
    { name: 'Photography & Video', icon: '📷' },
    { name: 'Security Services', icon: '💂' },
    { name: 'Professional Services', icon: '💼' },
    { name: 'Other Services', icon: '🛠️' },
  ]},
  { label: 'Industrial', emoji: '⚙️', bg: 'bg-lav', subs: [
    { name: 'Generators', icon: '⚡' },
    { name: 'Solar Panels & Equipment', icon: '☀️' },
    { name: 'Heavy Machinery', icon: '🏗️' },
    { name: 'Construction Materials', icon: '🧱' },
    { name: 'Tools & Equipment', icon: '🔨' },
    { name: 'Medical Equipment', icon: '🏥' },
    { name: 'Agricultural Equipment', icon: '🚜' },
    { name: 'Water Pumps & Tanks', icon: '💧' },
  ]},
  { label: 'Jobs', emoji: '💼', bg: 'bg-lav', subs: [
    { name: 'Full Time', icon: '👔' },
    { name: 'Part Time', icon: '⏰' },
    { name: 'Contract & Freelance', icon: '📋' },
    { name: 'NGO & International Orgs', icon: '🌍' },
    { name: 'Government & Public Sector', icon: '🏛️' },
    { name: 'Internship & Volunteer', icon: '🎓' },
    { name: 'Driver & Transport', icon: '🚗' },
    { name: 'Security Guard', icon: '💂' },
    { name: 'Remote Work', icon: '💻' },
  ]},
  { label: 'Beauty & Care', emoji: '💄', bg: 'bg-rose', subs: [
    { name: 'Skincare & Lotions', icon: '🧴' },
    { name: 'Hair Products & Wigs', icon: '💇' },
    { name: 'Makeup & Cosmetics', icon: '💄' },
    { name: 'Perfumes & Fragrances', icon: '🌸' },
    { name: 'Nail Care', icon: '💅' },
    { name: 'Salon & Barber Equipment', icon: '✂️' },
    { name: 'Men's Grooming', icon: '🪒' },
  ]},
  { label: 'Kids & Baby', emoji: '🧸', bg: 'bg-sun', subs: [
    { name: 'Toys & Games', icon: '🧸' },
    { name: 'Baby Clothes', icon: '👶' },
    { name: 'Strollers & Prams', icon: '🍼' },
    { name: "Kids' Furniture", icon: '🪑' },
    { name: 'School Bags & Supplies', icon: '🎒' },
    { name: 'Baby Food & Formula', icon: '🥛' },
    { name: 'Car Seats & Safety', icon: '🚗' },
  ]},
];

const CONDITIONS = ['Brand New', 'Like New', 'Used — Good condition', 'Used — Fair condition', 'For Parts / Not Working'];
const CITIES = ['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bor', 'Rumbek', 'Torit', 'Nimule', 'Other'];

function PostAdPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'preview' | 'done'>('form');
  const [selectedCat, setSelectedCat] = useState<typeof CATS[0] | null>(null);
  const [selectedSub, setSelectedSub] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<'cat' | 'sub'>('cat');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [cond, setCond] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: '/' });
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('phone, location').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.phone) setPhone(data.phone);
          if (data?.location) setCity(data.location.split(',')[0].trim());
        });
    }
  }, [user?.id]);

  const titleLen = title.length;
  const canNext = title.trim() && selectedCat && city;

  const uploadImage = async (files: FileList) => {
    if (!user || images.length >= 8) return;
    setUploading(true);
    const urls = [...images];
    for (const file of Array.from(files)) {
      if (urls.length >= 8) break;
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); continue; }
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setImages(urls);
    setUploading(false);
  };

  const removeImage = (url: string) => setImages(prev => prev.filter(u => u !== url));

  const handleSubmit = async () => {
    if (!user || !selectedCat || !title || !city) return;
    setSubmitting(true); setError('');
    const numPrice = parseFloat(price) || 0;
    const { error: err } = await supabase.from('listings').insert({
      user_id: user.id,
      title: title.trim(),
      description: desc.trim() || null,
      price: numPrice,
      price_label: negotiable ? `SSP ${numPrice.toLocaleString()} (Negotiable)` : numPrice ? `SSP ${numPrice.toLocaleString()}` : 'Contact for price',
      category: selectedCat.label,
      condition: cond || 'Used',
      location: city,
      emoji: selectedCat.emoji,
      bg_color: selectedCat.bg,
      phone: phone.trim() || null,
      images,
    });
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setStep('done');
  };

  const inp = 'w-full border border-[#e0e0e0] rounded-xl px-4 py-4 text-[15px] outline-none focus:border-[#d94f1e] transition-colors bg-white';

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f7]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-[#e5e5e5] h-14 flex items-center px-4 gap-3 sticky top-0 z-50">
        <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-base">🛍️</div>
          <span className="text-[#1a1a1a] text-lg font-black">souq<span className="text-[#d94f1e]">SS</span></span>
        </button>
        <div className="flex-1 text-center">
          <span className="text-[15px] font-bold text-[#1a1a1a]">Post ad</span>
        </div>
        <button onClick={() => navigate({ to: '/' })} className="text-[#d94f1e] text-[14px] font-semibold">Cancel</button>
      </nav>

      {/* ── DONE STATE ── */}
      {step === 'done' && (
        <div className="max-w-[500px] mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold mb-2">Your ad is live!</h2>
            <p className="text-[#777] text-[15px] mb-6">Your listing is now visible to buyers across South Sudan.</p>
            <div className="space-y-3">
              <button onClick={() => navigate({ to: '/' })} className="w-full bg-[#d94f1e] text-white rounded-xl py-3.5 text-[15px] font-bold hover:bg-[#c04418] transition-colors">Browse listings</button>
              <button onClick={() => navigate({ to: '/profile' })} className="w-full border-2 border-[#e5ddd8] text-[#555] rounded-xl py-3.5 text-[15px] font-semibold hover:border-[#d94f1e] transition-colors">View my listings</button>
              <button onClick={() => { setStep('form'); setTitle(''); setDesc(''); setPrice(''); setCond(''); setImages([]); setSelectedCat(null); setSelectedSub(''); }} className="w-full text-[#aaa] text-[13px] py-2">Post another ad</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN FORM ── */}
      {step === 'form' && (
        <div className="max-w-[600px] mx-auto px-4 py-5">

          {/* Clear button row */}
          <div className="flex items-center justify-end mb-3">
            <button onClick={() => { setTitle(''); setDesc(''); setPrice(''); setCond(''); setImages([]); setSelectedCat(null); setSelectedSub(''); setCity(''); }} className="text-[#d94f1e] text-[13px] font-semibold">Clear all</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e8e8e8]">

            {/* Title */}
            <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide">Title *</label>
                <span className={`text-[12px] font-semibold ${titleLen > 60 ? 'text-red-500' : 'text-[#aaa]'}`}>{titleLen} / 70</span>
              </div>
              <input
                className={inp}
                type="text"
                placeholder="What are you selling?"
                maxLength={70}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <button
              onClick={() => setShowCatPicker(true)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] hover:bg-[#faf5f2] transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedCat ? <span className="text-2xl">{selectedCat.emoji}</span> : <span className="text-xl text-[#aaa]">📂</span>}
                <div className="text-left">
                  <div className={`text-[15px] font-semibold ${selectedCat ? 'text-[#1a1a1a]' : 'text-[#aaa]'}`}>
                    {selectedCat ? selectedCat.label : 'Category *'}
                  </div>
                  {selectedSub && <div className="text-[12px] text-[#aaa]">{selectedSub}</div>}
                </div>
              </div>
              <span className="text-[#aaa] text-lg">›</span>
            </button>

            {/* Location */}
            <button
              onClick={() => setShowCityPicker(true)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] hover:bg-[#faf5f2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl text-[#aaa]">📍</span>
                <span className={`text-[15px] font-semibold ${city ? 'text-[#1a1a1a]' : 'text-[#aaa]'}`}>
                  {city || 'Select Location *'}
                </span>
              </div>
              <span className="text-[#aaa] text-lg">›</span>
            </button>

            {/* Photos */}
            <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="text-[13px] font-bold mb-1">Add photos</div>
              <p className="text-[12px] text-[#aaa] mb-3">
                <span className="text-[#d94f1e] font-semibold">First picture is the title picture.</span> Up to 8 photos · JPG or PNG · Max 10MB each
              </p>
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e0e0e0] group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[#d94f1e] text-white text-[8px] font-bold text-center py-0.5">MAIN</div>}
                    <button onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#d94f1e]/40 bg-[#fff5f0] flex flex-col items-center justify-center cursor-pointer hover:border-[#d94f1e] transition-colors">
                    {uploading ? <span className="text-xl">⏳</span> : <>
                      <span className="text-2xl text-[#d94f1e]">+</span>
                      <span className="text-[10px] text-[#d94f1e] font-semibold mt-0.5">Photo</span>
                    </>}
                    <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e => e.target.files && uploadImage(e.target.files)} />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Description</label>
              <textarea
                className={inp + ' resize-y min-h-[120px]'}
                placeholder="Describe your item — condition, age, specs, reason for selling…"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
              />
            </div>

            {/* Price */}
            <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Price (SSP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] font-semibold text-[14px]">SSP</span>
                <input
                  className={inp + ' pl-14'}
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <div
                  onClick={() => setNegotiable(!negotiable)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${negotiable ? 'bg-[#d94f1e] border-[#d94f1e]' : 'border-[#ccc]'}`}
                >
                  {negotiable && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-[14px] font-semibold text-[#555]">Price is negotiable</span>
              </label>
            </div>

            {/* Condition */}
            <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-3">Condition</label>
              <div className="space-y-2">
                {CONDITIONS.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setCond(c)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${cond === c ? 'border-[#d94f1e]' : 'border-[#ccc]'}`}
                    >
                      {cond === c && <div className="w-2.5 h-2.5 bg-[#d94f1e] rounded-full" />}
                    </div>
                    <span className="text-[14px] text-[#333]">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="p-5">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Contact Phone</label>
              <input
                className={inp}
                type="tel"
                placeholder="+211912345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <p className="text-[12px] text-[#aaa] mt-1.5">Buyers will use this number to contact you directly.</p>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-[13px] font-semibold mt-4">{error}</div>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canNext || submitting}
            className="w-full mt-4 bg-[#d94f1e] text-white rounded-xl py-4 text-[16px] font-bold disabled:opacity-30 disabled:bg-[#b0b8c0] disabled:cursor-not-allowed hover:bg-[#c04418] transition-colors"
          >
            {submitting ? 'Posting…' : canNext ? 'Post Ad Now' : 'Next'}
          </button>
          <p className="text-center text-[11px] text-[#bbb] mt-2">By posting you agree to SouqSS <span className="underline cursor-pointer">Terms of Use</span></p>
        </div>
      )}

      {/* ── CATEGORY PICKER ── */}
      {showCatPicker && (
        <div className="fixed inset-0 bg-black/50 z-[700] flex items-end sm:items-center justify-center" onClick={e => { if (e.target === e.currentTarget) { setShowCatPicker(false); setPickerStep('cat'); } }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[500px] max-h-[88vh] flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0f0f0]">
              {pickerStep === 'sub' && (
                <button onClick={() => setPickerStep('cat')} className="text-[#d94f1e] font-bold text-lg leading-none">‹</button>
              )}
              <h3 className="text-[16px] font-extrabold flex-1">
                {pickerStep === 'cat' ? 'Select Category' : selectedCat?.label}
              </h3>
              <button onClick={() => { setShowCatPicker(false); setPickerStep('cat'); }} className="text-2xl text-[#aaa] leading-none">×</button>
            </div>

            {pickerStep === 'cat' ? (
              <div className="overflow-y-auto flex-1">
                {CATS.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => { setSelectedCat(cat); setSelectedSub(''); setPickerStep('sub'); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-[#f5f5f5] text-left hover:bg-[#faf5f2] transition-colors ${selectedCat?.label === cat.label ? 'bg-[#fff5f0]' : ''}`}
                  >
                    <span className="text-2xl w-8 text-center flex-shrink-0">{cat.emoji}</span>
                    <span className="text-[14px] font-semibold flex-1">{cat.label}</span>
                    <span className="text-[#ccc]">›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                {selectedCat?.subs.map((sub: any) => (
                  <button
                    key={sub.name}
                    onClick={() => { setSelectedSub(sub.name); setShowCatPicker(false); setPickerStep('cat'); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-[#f5f5f5] text-left hover:bg-[#faf5f2] transition-colors ${selectedSub === sub.name ? 'bg-[#fff5f0]' : ''}`}
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">{sub.icon}</span>
                    <span className="text-[14px] font-semibold flex-1">{sub.name}</span>
                    {selectedSub === sub.name && <span className="text-[#d94f1e]">✓</span>}
                  </button>
                ))}
                {/* Other catch-all */}
                <button
                  onClick={() => { setSelectedSub(''); setShowCatPicker(false); setPickerStep('cat'); }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-[#f5f5f5] text-left hover:bg-[#faf5f2] transition-colors ${!selectedSub ? 'bg-[#fff5f0]' : ''}`}
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">📦</span>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold">Other / Not listed</div>
                    <div className="text-[11px] text-[#aaa]">Just use the description to explain what you're selling</div>
                  </div>
                  {!selectedSub && <span className="text-[#d94f1e]">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CITY PICKER ── */}
      {showCityPicker && (
        <div className="fixed inset-0 bg-black/50 z-[700] flex items-end sm:items-center justify-center" onClick={e => { if (e.target === e.currentTarget) setShowCityPicker(false); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[500px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-[16px] font-extrabold">Select City</h3>
              <button onClick={() => setShowCityPicker(false)} className="text-2xl text-[#aaa]">×</button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 pb-6">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setShowCityPicker(false); }}
                  className={`px-4 py-3 rounded-xl text-[14px] font-semibold text-left transition-colors border ${city === c ? 'bg-[#d94f1e] text-white border-[#d94f1e]' : 'border-[#e5ddd8] hover:border-[#d94f1e] text-[#333]'}`}
                >📍 {c}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
