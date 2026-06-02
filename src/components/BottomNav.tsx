import type { User } from '@supabase/supabase-js';

interface BottomNavProps {
  active: 'home' | 'search' | 'post' | 'saved' | 'profile';
  onHome: () => void;
  onSearch: () => void;
  onPost: () => void;
  onSaved: () => void;
  onProfile: () => void;
  user: User | null;
  savedCount: number;
}

export function BottomNav({ active, onHome, onSearch, onPost, onSaved, onProfile, user, savedCount }: BottomNavProps) {
  const btn = (icon: string, label: string, key: string, onClick: () => void, badge?: number) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors relative ${active === key ? 'text-[#d94f1e]' : 'text-[#999]'}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
      {badge ? (
        <span className="absolute top-1 right-[calc(50%-18px)] bg-[#d94f1e] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>
      ) : null}
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5ddd8] flex items-center z-[300] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {btn('🏠', 'Home', 'home', onHome)}
      {btn('🔍', 'Search', 'search', onSearch)}
      <button
        onClick={onPost}
        className="flex flex-col items-center gap-0.5 flex-1 py-2"
      >
        <div className="w-12 h-12 bg-[#d94f1e] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg -mt-5 mb-0.5">＋</div>
        <span className="text-[10px] font-semibold text-[#d94f1e]">Post</span>
      </button>
      {btn('❤️', 'Saved', 'saved', onSaved, savedCount)}
      {btn(user ? '👤' : '👤', user ? 'Profile' : 'Login', 'profile', onProfile)}
    </div>
  );
}
