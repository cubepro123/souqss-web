import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'iPhone 14', 'Toyota Hilux', 'Apartment Juba', 'Solar Panel', 'Generator',
  'MacBook Pro', 'Honda CG 125', 'Sofa set', 'Wedding dress', 'Samsung Galaxy',
  'Land Cruiser', 'Office space', 'Refrigerator', 'TV 55 inch', 'Motorcycle',
];

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'Search listings…', className = '', autoFocus }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      setFiltered(SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6));
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (s: string) => { onChange(s); setOpen(false); onSearch(s); };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-center bg-[#f5f0ed] border-2 border-transparent rounded-xl overflow-hidden focus-within:border-[#d94f1e] focus-within:bg-white transition-all">
        <input
          type="text"
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent px-4 py-3 text-[14px] outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setOpen(false); onSearch(value); } }}
        />
        {value && (
          <button onClick={() => { onChange(''); onSearch(''); }} className="px-2 text-[#aaa] hover:text-[#1a1a1a]">✕</button>
        )}
        <button
          onClick={() => { setOpen(false); onSearch(value); }}
          className="w-12 h-11 bg-[#d94f1e] flex items-center justify-center hover:bg-[#c04418] transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#e5ddd8] rounded-xl shadow-xl z-50 overflow-hidden mt-1">
          {filtered.map(s => (
            <button
              key={s}
              onClick={() => pick(s)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] hover:bg-[#fff5f0] text-left border-b border-[#f5f0ed] last:border-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
