import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/_authenticated/post-ad')({
  component: PostAdPage,
  head: () => ({ meta: [{ title: 'Post an Ad — SouqSS' }] }),
});

/* ─── CATEGORIES (from Jiji source) ─── */
const CATS = [
  { label: 'Vehicles', emoji: '🚗', bg: 'bg-sky', subs: [
    { name: 'Cars', icon: '🚗' },
    { name: 'Motorcycles & Scooters', icon: '🏍️' },
    { name: 'Buses & Microbuses', icon: '🚌' },
    { name: 'Trucks & Trailers', icon: '🚛' },
    { name: 'Pickup Trucks', icon: '🛻' },
    { name: 'Water Trucks', icon: '🚰' },
    { name: 'Tuk Tuks', icon: '🛺' },
    { name: 'Construction & Heavy Machinery', icon: '🏗️' },
    { name: 'Tractors & Farm Equipment', icon: '🚜' },
    { name: 'Watercraft & Boats', icon: '⛵' },
    { name: 'Personal Mobility', icon: '🛴' },
    { name: 'Vehicle Parts & Accessories', icon: '🔩' },
    { name: 'Car Services', icon: '🔧' },
    { name: 'Other Vehicles', icon: '🚙' },
  ]},
  { label: 'Property', emoji: '🏠', bg: 'bg-mint', subs: [
    { name: 'Houses & Apartments For Rent', icon: '🏠' },
    { name: 'Houses & Apartments For Sale', icon: '🏡' },
    { name: 'New Builds', icon: '🏗️' },
    { name: 'Land & Plots For Sale', icon: '🌍' },
    { name: 'Land & Plots For Rent', icon: '🌱' },
    { name: 'Short Let / Short Stay', icon: '🛏️' },
    { name: 'Commercial Property For Rent', icon: '🏪' },
    { name: 'Commercial Property For Sale', icon: '🏬' },
    { name: 'Event Centres & Venues', icon: '🎪' },
    { name: 'Warehouse & Storage', icon: '🏭' },
  ]},
  { label: 'Phones & Tablets', emoji: '📱', bg: 'bg-peach', subs: [
    { name: 'Mobile Phones', icon: '📱' },
    { name: 'Tablets', icon: '📲' },
    { name: 'Accessories for Phones & Tablets', icon: '🎧' },
    { name: 'Smart Watches', icon: '⌚' },
  ]},
  { label: 'Electronics', emoji: '💻', bg: 'bg-peach', subs: [
    { name: 'Laptops & Computers', icon: '💻' },
    { name: 'Computer Accessories', icon: '🖱️' },
    { name: 'Computer Hardware', icon: '💾' },
    { name: 'Computer Monitors', icon: '🖥️' },
    { name: 'Printers & Scanners', icon: '🖨️' },
    { name: 'TV & Video Equipment', icon: '📺' },
    { name: 'Audio & Music Equipment', icon: '🔊' },
    { name: 'Headphones', icon: '🎧' },
    { name: 'Photo & Video Cameras', icon: '📷' },
    { name: 'Video Game Consoles', icon: '🎮' },
    { name: 'Video Games', icon: '🕹️' },
    { name: 'Security & Surveillance', icon: '📹' },
    { name: 'Networking Products', icon: '📡' },
    { name: 'Software', icon: '💿' },
    { name: 'Accessories & Supplies', icon: '🔌' },
  ]},
  { label: 'Home & Furniture', emoji: '🛋️', bg: 'bg-cream', subs: [
    { name: 'Furniture', icon: '🛋️' },
    { name: 'Beds & Mattresses', icon: '🛏️' },
    { name: 'Home Appliances', icon: '🧺' },
    { name: 'Kitchen Appliances', icon: '🍳' },
    { name: 'Kitchenware & Cookware', icon: '🥘' },
    { name: 'Home Accessories & Décor', icon: '🖼️' },
    { name: 'Lighting', icon: '💡' },
    { name: 'Storage & Organization', icon: '📦' },
    { name: 'Household Chemicals', icon: '🧹' },
    { name: 'Garden Supplies', icon: '🌿' },
  ]},
  { label: 'Fashion', emoji: '👗', bg: 'bg-rose', subs: [
    { name: "Women's Clothing", icon: '👗' },
    { name: "Women's Shoes", icon: '👠' },
    { name: "Women's Bags", icon: '👜' },
    { name: "Women's Jewelry & Accessories", icon: '💍' },
    { name: "Women's Watches", icon: '⌚' },
    { name: "Women's Wedding Wear", icon: '👰' },
    { name: "Men's Clothing", icon: '👔' },
    { name: "Men's Shoes", icon: '👟' },
    { name: "Men's Bags", icon: '🎒' },
    { name: "Men's Jewelry & Accessories", icon: '💎' },
    { name: "Men's Watches", icon: '⌚' },
    { name: "Men's Wedding Wear", icon: '🤵' },
    { name: 'Traditional Wear', icon: '👘' },
    { name: "Second-hand / Mitumba", icon: '♻️' },
    { name: "Children's Clothing", icon: '🧒' },
    { name: "Children's Shoes", icon: '👟' },
  ]},
  { label: 'Beauty & Care', emoji: '💄', bg: 'bg-rose', subs: [
    { name: 'Hair Beauty', icon: '💇' },
    { name: 'Face Care & Skincare', icon: '🧴' },
    { name: 'Body Care', icon: '🛁' },
    { name: 'Oral Care', icon: '🦷' },
    { name: 'Makeup & Cosmetics', icon: '💄' },
    { name: 'Fragrance & Perfumes', icon: '🌸' },
    { name: 'Nail Care', icon: '💅' },
    { name: "Men's Grooming", icon: '🪒' },
    { name: 'Vitamins & Supplements', icon: '💊' },
    { name: 'Tools & Accessories', icon: '✂️' },
    { name: 'Health & Beauty Services', icon: '🏥' },
  ]},
  { label: 'Services', emoji: '🔧', bg: 'bg-steel', subs: [
    { name: 'Building & Trades Services', icon: '🏗️' },
    { name: 'Car Repair & Services', icon: '🔧' },
    { name: 'Computer & IT Services', icon: '💻' },
    { name: 'Repair Services', icon: '🛠️' },
    { name: 'Cleaning Services', icon: '🧹' },
    { name: 'Printing Services', icon: '🖨️' },
    { name: 'Logistics Services', icon: '🚚' },
    { name: 'Legal Services', icon: '⚖️' },
    { name: 'Tax & Financial Services', icon: '💰' },
    { name: 'Recruitment Services', icon: '🤝' },
    { name: 'Chauffeur & Transport', icon: '🚗' },
    { name: 'Travel Agents & Tours', icon: '✈️' },
    { name: 'Classes & Courses', icon: '📚' },
    { name: 'Child Care & Education', icon: '👶' },
    { name: 'Fitness & Personal Training', icon: '💪' },
    { name: 'Party, Catering & Events', icon: '🎉' },
    { name: 'DJ & Entertainment', icon: '🎵' },
    { name: 'Wedding Venues & Services', icon: '💒' },
    { name: 'Photography & Video', icon: '📷' },
    { name: 'Landscaping & Gardening', icon: '🌿' },
    { name: 'Manufacturing Services', icon: '🏭' },
    { name: 'Rental Services', icon: '🔑' },
    { name: 'Other Services', icon: '🛠️' },
  ]},
  { label: 'Industrial', emoji: '⚙️', bg: 'bg-lav', subs: [
    { name: 'Generators', icon: '⚡' },
    { name: 'Solar & Renewable Energy', icon: '☀️' },
    { name: 'Inverters & Backup Batteries', icon: '🔋' },
    { name: 'Building Materials & Supplies', icon: '🧱' },
    { name: 'Plumbing & Water Systems', icon: '🚰' },
    { name: 'Electrical Hand Tools', icon: '🔌' },
    { name: 'Hand Tools', icon: '🔨' },
    { name: 'Measuring & Testing Tools', icon: '📏' },
    { name: 'Hardware & Fasteners', icon: '🔩' },
    { name: 'Doors & Security', icon: '🚪' },
    { name: 'Windows & Glass', icon: '🪟' },
    { name: 'Welding & Industrial Equipment', icon: '⚙️' },
    { name: 'Other Repair & Construction', icon: '🏚️' },
  ]},
  { label: 'Industrial', emoji: '🏭', bg: 'bg-steel', subs: [
    { name: 'Medical Equipment & Supplies', icon: '🏥' },
    { name: 'Safety Equipment & Gear', icon: '🦺' },
    { name: 'Manufacturing Equipment', icon: '🏭' },
    { name: 'Retail & Store Equipment', icon: '🏪' },
    { name: 'Restaurant & Catering Equipment', icon: '👨‍🍳' },
    { name: 'Stationery & Office Equipment', icon: '📎' },
    { name: 'Salon & Beauty Equipment', icon: '✂️' },
    { name: 'Printing & Graphics Equipment', icon: '🖨️' },
    { name: 'Stage & Event Equipment', icon: '🎪' },
  ]},
  { label: 'Pets', emoji: '🐾', bg: 'bg-sage', subs: [
    { name: 'Dogs & Puppies', icon: '🐕' },
    { name: 'Cats & Kittens', icon: '🐈' },
    { name: 'Birds', icon: '🦜' },
    { name: 'Fish & Aquarium', icon: '🐠' },
    { name: 'Chickens & Poultry', icon: '🐔' },
    { name: 'Goats & Sheep', icon: '🐐' },
    { name: 'Cattle & Cows', icon: '🐄' },
    { name: "Pet's Accessories", icon: '🦴' },
    { name: 'Pet Services', icon: '💉' },
    { name: 'Other Animals', icon: '🐾' },
  ]},
  { label: 'Food & Groceries', emoji: '🥭', bg: 'bg-sage', subs: [
    { name: 'Food & Beverages', icon: '🍽️' },
    { name: 'Fresh Fruits & Vegetables', icon: '🥦' },
    { name: 'Grains & Cereals', icon: '🌾' },
    { name: 'Meat & Fish', icon: '🥩' },
    { name: 'Farm Animals', icon: '🐄' },
    { name: 'Seeds & Fertilizers', icon: '🌱' },
    { name: 'Farm Machinery & Equipment', icon: '🚜' },
    { name: 'Farm Animal Feed & Supplements', icon: '🌽' },
  ]},
  { label: 'Services', emoji: '⚽', bg: 'bg-sky', subs: [
    { name: 'Sports Equipment', icon: '⚽' },
    { name: 'Musical Instruments & Gear', icon: '🎸' },
    { name: 'Books & Table Games', icon: '📚' },
    { name: 'Arts, Crafts & Awards', icon: '🎨' },
    { name: 'Outdoor & Camping Gear', icon: '⛺' },
    { name: 'Music & Video', icon: '🎵' },
    { name: 'Massagers', icon: '💆' },
    { name: 'Personal Mobility', icon: '🛴' },
    { name: 'Smoking Accessories', icon: '💨' },
  ]},
  { label: 'Babies & Kids', emoji: '🧸', bg: 'bg-sun', subs: [
    { name: 'Toys & Games', icon: '🧸' },
    { name: "Children's Furniture", icon: '🪑' },
    { name: "Children's Clothing", icon: '👶' },
    { name: "Children's Shoes", icon: '👟' },
    { name: 'Babies & Kids Accessories', icon: '🎒' },
    { name: 'Baby Gear & Equipment', icon: '🍼' },
    { name: 'Care & Feeding', icon: '🥛' },
    { name: 'Maternity & Pregnancy', icon: '🤰' },
    { name: 'Transport & Safety', icon: '🚗' },
    { name: 'Playground Equipment', icon: '🛝' },
  ]},
  { label: 'Jobs', emoji: '💼', bg: 'bg-lav', subs: [
    { name: 'Accounting & Finance Jobs', icon: '💰' },
    { name: 'Advertising & Marketing Jobs', icon: '📣' },
    { name: 'Arts & Entertainment Jobs', icon: '🎭' },
    { name: 'Computing & IT Jobs', icon: '💻' },
    { name: 'Construction & Skilled Trade Jobs', icon: '🏗️' },
    { name: 'Customer Services Jobs', icon: '🎧' },
    { name: 'Driver Jobs', icon: '🚗' },
    { name: 'Engineering & Architecture Jobs', icon: '📐' },
    { name: 'Farming & Veterinary Jobs', icon: '🌾' },
    { name: 'Healthcare & Nursing Jobs', icon: '🏥' },
    { name: 'Hotel Jobs', icon: '🏨' },
    { name: 'Housekeeping & Cleaning Jobs', icon: '🧹' },
    { name: 'Internship Jobs', icon: '🎓' },
    { name: 'Legal Jobs', icon: '⚖️' },
    { name: 'Logistics & Transportation Jobs', icon: '🚚' },
    { name: 'Management Jobs', icon: '👔' },
    { name: 'Manual Labour Jobs', icon: '🔨' },
    { name: 'NGO & International Orgs', icon: '🌍' },
    { name: 'Part-time & Weekend Jobs', icon: '⏰' },
    { name: 'Restaurant & Bar Jobs', icon: '🍽️' },
    { name: 'Sales & Telemarketing Jobs', icon: '📞' },
    { name: 'Security Jobs', icon: '💂' },
    { name: 'Teaching Jobs', icon: '📚' },
    { name: 'Technology Jobs', icon: '💡' },
    { name: 'Other Jobs', icon: '💼' },
  ]},
  { label: 'Seeking Work - CVs', emoji: '📄', bg: 'bg-lav', subs: [
    { name: 'Accounting & Finance CVs', icon: '💰' },
    { name: 'Computing & IT CVs', icon: '💻' },
    { name: 'Driver CVs', icon: '🚗' },
    { name: 'Engineering CVs', icon: '📐' },
    { name: 'Healthcare & Nursing CVs', icon: '🏥' },
    { name: 'Legal CVs', icon: '⚖️' },
    { name: 'Management CVs', icon: '👔' },
    { name: 'Teaching CVs', icon: '📚' },
    { name: 'Technology CVs', icon: '💡' },
    { name: 'Other CVs', icon: '📄' },
  ]},
];

const CITIES = ['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bor', 'Rumbek', 'Torit', 'Nimule', 'Bentiu', 'Other'];
const CONDITIONS = ['Brand New', 'Like New', 'Used — Good condition', 'Used — Fair condition', 'For Parts / Not Working'];

/* ─── STEP TYPE ─── */
type Step = 'category' | 'subcategory' | 'details' | 'done';

function PostAdPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('category');
  const [selectedCat, setSelectedCat] = useState<typeof CATS[0] | null>(null);
  const [selectedSub, setSelectedSub] = useState('');

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
  const [catSearch, setCatSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

  const uploadImages = async (files: FileList) => {
    if (!user || images.length >= 8) return;
    setUploading(true);
    const urls = [...images];
    for (const file of Array.from(files)) {
      if (urls.length >= 8) break;
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) { alert('Max 10MB per image'); continue; }
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setImages(urls);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!user || !selectedCat || !title.trim() || !city) return;
    setSubmitting(true); setError('');
    const numPrice = parseFloat(price) || 0;
    const { error: err } = await supabase.from('listings').insert({
      user_id: user.id,
      title: title.trim(),
      description: desc.trim() || null,
      price: numPrice,
      price_label: negotiable ? `SSP ${numPrice.toLocaleString()} (Negotiable)` : numPrice ? `SSP ${numPrice.toLocaleString()}` : 'Contact for price',
      category: selectedSub || selectedCat.label,
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

  const reset = () => {
    setStep('category'); setSelectedCat(null); setSelectedSub('');
    setTitle(''); setDesc(''); setPrice(''); setCond(''); setImages([]);
    setCatSearch('');
  };

  const filteredCats = catSearch
    ? CATS.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase()))
    : CATS;

  const canSubmit = selectedCat && title.trim() && city;
  const titleLen = title.length;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f7]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-[#e5e5e5] h-14 flex items-center px-4 sticky top-0 z-50 shadow-sm">
        <button onClick={() => step === 'category' ? navigate({ to: '/' }) : step === 'subcategory' ? setStep('category') : step === 'details' ? setStep('subcategory') : null}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors text-lg text-[#555]">
          ‹
        </button>
        <div className="flex-1 text-center text-[15px] font-bold text-[#1a1a1a]">
          {step === 'category' ? 'Select category' : step === 'subcategory' ? selectedCat?.label : step === 'details' ? 'Post ad' : 'Done!'}
        </div>
        {step === 'details' && (
          <button onClick={reset} className="text-[#d94f1e] text-[13px] font-semibold">Clear</button>
        )}
        {step === 'category' && (
          <button onClick={() => navigate({ to: '/' })} className="text-[#d94f1e] text-[13px] font-semibold">Cancel</button>
        )}
      </nav>

      {/* ── DONE ── */}
      {step === 'done' && (
        <div className="max-w-[480px] mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-extrabold mb-2">Your ad is live!</h2>
            <p className="text-[#777] text-[14px] mb-6">Your listing is now visible to buyers across South Sudan.</p>
            <div className="space-y-3">
              <button onClick={() => navigate({ to: '/' })} className="w-full bg-[#d94f1e] text-white rounded-xl py-3.5 text-[14px] font-bold hover:bg-[#c04418] transition-colors">Browse listings</button>
              <button onClick={() => navigate({ to: '/profile' })} className="w-full border-2 border-[#e5ddd8] text-[#555] rounded-xl py-3.5 text-[14px] font-semibold hover:border-[#d94f1e] transition-colors">View my listings</button>
              <button onClick={reset} className="text-[#aaa] text-[13px] py-1">Post another ad</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: CATEGORY ── */}
      {step === 'category' && (
        <div className="max-w-[600px] mx-auto">
          {/* Search bar */}
          <div className="bg-white border-b border-[#e5e5e5] px-4 py-3">
            <div className="flex items-center bg-[#f0f4f7] rounded-xl px-3 py-2 gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search categories"
                className="flex-1 bg-transparent outline-none text-[14px]"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
              />
              {catSearch && <button onClick={() => setCatSearch('')} className="text-[#aaa] text-sm">✕</button>}
            </div>
          </div>

          {/* Category list */}
          <div className="bg-white">
            {filteredCats.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => { setSelectedCat(cat); setSelectedSub(''); setStep('subcategory'); }}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#faf5f2] transition-colors ${i < filteredCats.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}
              >
                <span className="text-2xl w-8 text-center flex-shrink-0">{cat.emoji}</span>
                <span className="flex-1 text-[15px] font-semibold text-[#1a1a1a]">{cat.label}</span>
                <span className="text-[#ccc] text-lg">›</span>
              </button>
            ))}
            {filteredCats.length === 0 && (
              <div className="text-center py-12 text-[#aaa]">
                <div className="text-3xl mb-2">🔍</div>
                <div className="text-[14px]">No categories found</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: SUBCATEGORY ── */}
      {step === 'subcategory' && selectedCat && (
        <div className="max-w-[600px] mx-auto bg-white">
          {/* Post without subcategory */}
          <button
            onClick={() => { setSelectedSub(''); setStep('details'); }}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-[#f5f5f5] hover:bg-[#faf5f2] transition-colors"
          >
            <span className="text-2xl w-8 text-center flex-shrink-0">{selectedCat.emoji}</span>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-[#1a1a1a]">All in {selectedCat.label}</div>
              <div className="text-[12px] text-[#aaa]">Post without selecting a subcategory</div>
            </div>
            <span className="text-[#ccc] text-lg">›</span>
          </button>

          {/* Subcategories */}
          {selectedCat.subs.map((sub, i) => (
            <button
              key={sub.name}
              onClick={() => { setSelectedSub(sub.name); setStep('details'); }}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#faf5f2] transition-colors ${i < selectedCat.subs.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}
            >
              <span className="text-xl w-8 text-center flex-shrink-0">{sub.icon}</span>
              <span className="flex-1 text-[14px] font-semibold text-[#1a1a1a]">{sub.name}</span>
              <span className="text-[#ccc] text-lg">›</span>
            </button>
          ))}

          {/* Other */}
          <button
            onClick={() => { setSelectedSub('Other'); setStep('details'); }}
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-[#f5f5f5] hover:bg-[#faf5f2] transition-colors"
          >
            <span className="text-xl w-8 text-center flex-shrink-0">📦</span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-[#1a1a1a]">Other / Not listed</div>
              <div className="text-[12px] text-[#aaa]">Describe it in the title and description</div>
            </div>
            <span className="text-[#ccc] text-lg">›</span>
          </button>
        </div>
      )}

      {/* ── STEP 3: DETAILS FORM ── */}
      {step === 'details' && (
        <div className="max-w-[600px] mx-auto px-4 py-4 pb-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-[#aaa] mb-4">
            <button onClick={() => setStep('category')} className="hover:text-[#d94f1e] transition-colors">{selectedCat?.emoji} {selectedCat?.label}</button>
            {selectedSub && selectedSub !== 'Other' && <>
              <span>›</span>
              <span className="text-[#555] font-semibold">{selectedSub}</span>
            </>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e8e8e8]">

            {/* Title */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide">Title *</label>
                <span className={`text-[11px] font-semibold ${titleLen > 60 ? 'text-red-500' : 'text-[#ccc]'}`}>{titleLen}/70</span>
              </div>
              <input
                className="w-full border-0 outline-none text-[15px] text-[#1a1a1a] placeholder-[#ccc]"
                type="text"
                placeholder="What are you selling?"
                maxLength={70}
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Photos */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <div className="text-[13px] font-bold mb-0.5">Add photo</div>
              <p className="text-[12px] mb-3">
                <span className="text-green-600 font-semibold">First picture is the title picture.</span>
                <span className="text-[#aaa]"> You can change the order: just grab your photos and drag</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={url} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#e0e0e0] group flex-shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5">MAIN</div>}
                    <button onClick={() => setImages(prev => prev.filter(u => u !== url))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-green-400 bg-green-50 flex flex-col items-center justify-center flex-shrink-0 hover:bg-green-100 transition-colors"
                  >
                    {uploading ? <span className="text-lg">⏳</span> : <span className="text-3xl text-green-500 font-light">+</span>}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#aaa] mt-2">Supported formats are *.jpg and *.png</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={e => e.target.files && uploadImages(e.target.files)} />
            </div>

            {/* Description */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Description</label>
              <textarea
                className="w-full border-0 outline-none text-[14px] text-[#1a1a1a] placeholder-[#ccc] resize-none"
                rows={4}
                placeholder="Describe your item — condition, age, specs, reason for selling…"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Price (SSP)</label>
              <div className="flex items-center gap-2">
                <span className="text-[#aaa] text-[14px] font-semibold">SSP</span>
                <input
                  className="flex-1 border-0 outline-none text-[15px] text-[#1a1a1a] placeholder-[#ccc]"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
                <div onClick={() => setNegotiable(!negotiable)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${negotiable ? 'bg-[#d94f1e] border-[#d94f1e]' : 'border-[#ccc]'}`}>
                  {negotiable && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="text-[14px] text-[#555]">Price is negotiable</span>
              </label>
            </div>

            {/* Location */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Location *</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCity(c)} className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${city === c ? 'bg-[#d94f1e] text-white border-[#d94f1e]' : 'border-[#e5ddd8] text-[#555] hover:border-[#d94f1e]'}`}>{c}</button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="px-5 py-4 border-b border-[#f0f0f0]">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-3">Condition</label>
              <div className="space-y-2.5">
                {CONDITIONS.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer" onClick={() => setCond(c)}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${cond === c ? 'border-[#d94f1e]' : 'border-[#ccc]'}`}>
                      {cond === c && <div className="w-2.5 h-2.5 bg-[#d94f1e] rounded-full" />}
                    </div>
                    <span className="text-[14px] text-[#333]">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="px-5 py-4">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-wide block mb-2">Contact Phone</label>
              <input
                className="w-full border-0 outline-none text-[15px] text-[#1a1a1a] placeholder-[#ccc]"
                type="tel"
                placeholder="+211912345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <p className="text-[11px] text-[#aaa] mt-1">Buyers will contact you on this number</p>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-[13px] font-semibold mt-4">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full mt-4 bg-[#d94f1e] disabled:bg-[#b0b8c0] text-white rounded-xl py-4 text-[16px] font-bold transition-colors hover:bg-[#c04418]"
          >
            {submitting ? 'Posting…' : canSubmit ? 'Post Ad Now' : 'Next'}
          </button>
          <p className="text-center text-[11px] text-[#bbb] mt-2">By posting you agree to SouqSS <span className="underline cursor-pointer">Terms of Use</span></p>
        </div>
      )}
    </div>
  );
}
