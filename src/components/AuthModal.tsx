import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ open, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const clearMsg = () => setMsg(null);

  const handleAuth = async () => {
    setMsg(null);
    if (!email || !password) { setMsg({ text: 'Please fill in all fields.', type: 'error' }); return; }
    if (password.length < 6) { setMsg({ text: 'Password must be at least 6 characters.', type: 'error' }); return; }
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirm) { setMsg({ text: 'Passwords do not match.', type: 'error' }); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setMsg({ text: error.message, type: 'error' });
      else setMsg({ text: '✓ Account created! Check your email to confirm.', type: 'success' });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ text: error.message, type: 'error' });
      else { setMsg({ text: '✓ Signed in!', type: 'success' }); setTimeout(onClose, 900); }
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) { setMsg({ text: 'Enter your email above first.', type: 'error' }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMsg({ text: error.message, type: 'error' });
    else setMsg({ text: '✓ Reset link sent! Check your inbox.', type: 'success' });
  };

  const inputCls = 'w-full bg-[#f5f0ed] border-2 border-transparent rounded-[10px] px-3.5 py-3 text-sm font-[Inter,sans-serif] outline-none focus:border-[#d94f1e] transition-colors';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[440px] p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#1a1a1a]">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="text-[13px] text-[#777] mt-1">
              {mode === 'signin'
                ? 'Sign in to post ads, save listings and message sellers.'
                : "Join South Sudan's biggest marketplace — it's free."}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-[#aaa] hover:text-[#1a1a1a] transition-colors leading-none mt-1">×</button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-[#f5f0ed] rounded-full p-1 mb-5">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); clearMsg(); }}
              className={`rounded-full py-2.5 text-[13px] font-semibold transition-all ${mode === m ? 'bg-white text-[#1a1a1a] shadow-md font-bold' : 'text-[#999]'}`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-[13px] font-semibold block mb-1.5">Full Name</label>
              <input className={inputCls} type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div>
            <label className="text-[13px] font-semibold block mb-1.5">Email</label>
            <input className={inputCls} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[13px] font-semibold">Password</label>
              {mode === 'signin' && (
                <a href="#" onClick={handleForgot} className="text-[12px] text-[#d94f1e] font-semibold hover:underline">Forgot password?</a>
              )}
            </div>
            <div className="relative">
              <input
                className={inputCls + ' pr-10'}
                type={showPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] text-sm"
              >👁</button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-[13px] font-semibold block mb-1.5">Confirm Password</label>
              <input className={inputCls} type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div className={`mt-4 px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold border ${
            msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full mt-5 bg-[#d94f1e] text-white rounded-xl py-3.5 text-[15px] font-bold disabled:opacity-70 hover:bg-[#c04418] transition-colors"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-[12px] text-[#aaa] mt-4">
          By continuing you agree to SouqSS{' '}
          <a href="#" className="text-[#d94f1e]">Terms</a> &amp;{' '}
          <a href="#" className="text-[#d94f1e]">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
