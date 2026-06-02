interface SafetyTipsProps {
  open: boolean;
  onClose: () => void;
}

export function SafetyTips({ open, onClose }: SafetyTipsProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[700] flex items-center justify-center p-6" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[440px] p-7 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">🛡️</div>
          <h3 className="text-[18px] font-extrabold">Stay Safe on SouqSS</h3>
        </div>
        <div className="space-y-3.5">
          {[
            ['🤝', 'Meet in a public place', 'Choose busy public spots like markets, cafés or police stations for meetups. Never meet at your home.'],
            ['💰', 'Never pay in advance', 'Do not send money before seeing the item. Avoid wire transfers or mobile money to strangers.'],
            ['👀', 'Inspect before buying', 'Always check the item in person before paying. Test electronics, check documents for vehicles.'],
            ['📞', 'Verify the seller', 'Call the seller before meeting. Be wary of deals that seem too good to be true.'],
            ['🚫', 'Report suspicious ads', 'If something feels wrong, use the Report button on the listing. We review all reports within 24 hours.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
              <div>
                <div className="text-[13px] font-bold text-[#1a1a1a]">{title}</div>
                <div className="text-[12px] text-[#777] mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-[#1a1a1a] text-white rounded-xl py-3 text-[14px] font-bold hover:bg-[#333] transition-colors">Got it, stay safe!</button>
      </div>
    </div>
  );
}
