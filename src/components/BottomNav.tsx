import type { User } from '@supabase/supabase-js';

interface BottomNavProps {
  active: 'home' | 'post' | 'profile';
  onHome: () => void;
  onPost: () => void;
  onProfile: () => void;
  user: User | null;
}

export function BottomNav({ active, onHome, onPost, onProfile, user }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] lg:hidden flex items-end justify-around bg-[#0e0e0e] border-t border-[#2a2a2a]" style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 72 }}>
      <button onClick={onHome} className="flex flex-col items-center gap-1 flex-1 py-3 transition-colors">
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active === 'home' ? '#E8440A' : '#888'} xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, color: active === 'home' ? '#E8440A' : '#888' }}>Home</span>
      </button>

      <button onClick={onPost} className="flex flex-col items-center flex-1 relative" style={{ marginTop: -16 }}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#E8440A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(232,68,10,.5)', fontSize: 28, color: '#fff', fontWeight: 300 }}>＋</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#E8440A', marginTop: 3 }}>Post</span>
      </button>

      <button onClick={onProfile} className="flex flex-col items-center gap-1 flex-1 py-3 transition-colors">
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active === 'profile' ? '#E8440A' : '#888'} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, color: active === 'profile' ? '#E8440A' : '#888' }}>Profile</span>
      </button>
    </div>
  );
}
