import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2500);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div className={`fixed bottom-7 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-5 py-3 rounded-full text-[13px] font-semibold z-[900] whitespace-nowrap pointer-events-none transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {message}
    </div>
  );
}

// Hook to use toast
import { useCallback, useRef } from 'react';

export function useToast() {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const toast = useCallback((text: string) => {
    setMsg('');
    clearTimeout(timer.current);
    setTimeout(() => setMsg(text), 10);
    timer.current = setTimeout(() => setMsg(''), 3000);
  }, []);

  return { msg, toast, clearToast: () => setMsg('') };
}
