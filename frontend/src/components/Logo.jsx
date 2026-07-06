export default function Logo({ size = 34, showText = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg1" x1="4" y1="26" x2="26" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE"/>
            <stop offset="100%" stopColor="#818CF8"/>
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#0D1425" stroke="url(#lg1)" strokeWidth="1.5"/>
        <path d="M7 22L12 13L16.5 17.5L22 9" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="9" r="2.5" fill="#22D3EE"/>
        <circle cx="7" cy="22" r="1.5" fill="#818CF8" opacity="0.6"/>
      </svg>
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight">
          <span className="text-white">Pratibha</span><span className="gradient-text">Path</span>
        </span>
      )}
    </div>
  );
}
