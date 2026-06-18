const RealisticCandle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Glow */}
    <circle cx="30" cy="35" r="30" fill="url(#glow-rc)" className="animate-candle-glow" />
    {/* Flame outer */}
    <path
      d="M30 8 C30 8 42 28 42 46 C42 57 30 58 30 58 C30 58 18 57 18 46 C18 28 30 8 30 8Z"
      fill="url(#flame-outer-rc)"
      className="animate-flame-sway"
    />
    {/* Flame inner */}
    <path
      d="M30 22 C30 22 36 38 36 49 C36 54 30 55 30 55 C30 55 24 54 24 49 C24 38 30 22 30 22Z"
      fill="url(#flame-inner-rc)"
      className="animate-flicker"
      style={{ animationDelay: '0.15s' }}
    />
    {/* Flame core */}
    <path
      d="M30 34 C30 34 33 43 33 50 C33 53 30 54 30 54 C30 54 27 53 27 50 C27 43 30 34 30 34Z"
      fill="white"
      opacity="0.9"
      className="animate-flicker"
      style={{ animationDelay: '0.3s' }}
    />
    {/* Wick */}
    <path d="M30 53 V62" stroke="#2a1a0a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Candle body */}
    <path d="M19 60 C19 60 30 56 41 60 V136 C41 139 30 141 19 136 V60Z" fill="url(#candle-body-rc)" />
    {/* Melted wax top */}
    <ellipse cx="30" cy="60" rx="11" ry="3.5" fill="#fdfaf5" />
    <path d="M21 60 Q24 70 27 61" stroke="#fdfaf5" strokeWidth="2" fill="none" />
    <path d="M38 61 Q36 68 34 62" stroke="#fdfaf5" strokeWidth="1.5" fill="none" />
    <defs>
      <radialGradient id="glow-rc" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#ff6600" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="flame-outer-rc" x1="30" y1="8" x2="30" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffe066" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#ff8800" stopOpacity="0.95" />
        <stop offset="80%" stopColor="#dd2200" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#aa0000" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="flame-inner-rc" x1="30" y1="22" x2="30" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#ffff88" />
        <stop offset="70%" stopColor="#ffcc00" />
        <stop offset="100%" stopColor="#ff8800" />
      </linearGradient>
      <linearGradient id="candle-body-rc" x1="19" y1="60" x2="41" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d4c9b8" />
        <stop offset="15%" stopColor="#f5efe4" />
        <stop offset="50%" stopColor="#fdfaf5" />
        <stop offset="85%" stopColor="#ede8de" />
        <stop offset="100%" stopColor="#c8bfb0" />
      </linearGradient>
    </defs>
  </svg>
);

export default RealisticCandle;
