import React from 'react';

/* CSS injected once for TricksterA animations */
const CSS = `
@keyframes ta-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes ta-spark1 { 0%,100%{opacity:0;transform:scale(0.3)} 40%{opacity:1;transform:scale(1)} }
@keyframes ta-spark2 { 0%,100%{opacity:0;transform:scale(0.3)} 60%{opacity:1;transform:scale(1)} }
@keyframes ta-shadow  { 0%,100%{transform:scaleX(1);opacity:0.15} 50%{transform:scaleX(0.8);opacity:0.07} }
`;
if (typeof document !== 'undefined' && !document.getElementById('ta-css')) {
  const s = document.createElement('style');
  s.id = 'ta-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ───────────────────────────────────────────────────
   TRICKSTER A — The Prediction Wizard
   Pointed hat · round face · card fan in hand
   Used on: hero section (left player)
─────────────────────────────────────────────────── */
export default function TricksterA() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Floating wrapper */}
      <div style={{ animation: 'ta-float 3.2s ease-in-out infinite' }}>
        <svg viewBox="0 0 300 450" width="240" style={{ overflow: 'visible' }}>

          {/* Ground shadow */}
          <ellipse
            cx="150" cy="442" rx="72" ry="9"
            fill="#111" style={{ animation: 'ta-shadow 3.2s ease-in-out infinite' }}
          />

          {/* Floating particles */}
          <circle cx="54" cy="246" r="7.5" fill="#C8FF00"
            style={{ animation: 'ta-spark1 2.8s ease-in-out 0s infinite' }} />
          <circle cx="44" cy="318" r="5.5" fill="#FF2D78"
            style={{ animation: 'ta-spark2 2.8s ease-in-out 0.9s infinite' }} />
          <circle cx="62" cy="380" r="3.5" fill="#C8FF00"
            style={{ animation: 'ta-spark1 2.8s ease-in-out 1.6s infinite' }} />

          {/* Body — white trapezoid */}
          <polygon
            points="92,256 208,256 256,422 44,422"
            fill="#ffffff" stroke="#111" strokeWidth="3"
          />
          {/* Center dashed line on robe */}
          <line
            x1="150" y1="260" x2="150" y2="418"
            stroke="#ccc" strokeWidth="1.5" strokeDasharray="9,7"
          />

          {/* Card fan — right hand side */}
          {/* Card 3 (back, lime) */}
          <g transform="rotate(-28, 218, 308)">
            <rect x="193" y="274" width="50" height="68" rx="6"
              fill="#C8FF00" stroke="#111" strokeWidth="2.5" />
            <circle cx="218" cy="308" r="12" fill="white" opacity="0.5" />
          </g>
          {/* Card 2 (middle, white) */}
          <g transform="rotate(-10, 222, 306)">
            <rect x="197" y="272" width="50" height="68" rx="6"
              fill="white" stroke="#111" strokeWidth="2.5" />
            <circle cx="222" cy="306" r="12" fill="#111" opacity="0.12" />
            <text x="222" y="310" textAnchor="middle" fontSize="10"
              fill="#888" fontFamily="'JetBrains Mono', monospace">◆</text>
          </g>
          {/* Card 1 (front, pink) */}
          <g transform="rotate(10, 228, 308)">
            <rect x="203" y="274" width="50" height="68" rx="6"
              fill="#FF2D78" stroke="#111" strokeWidth="2.5" />
            <circle cx="228" cy="308" r="12" fill="white" opacity="0.3" />
          </g>

          {/* HAT — big black triangle (drawn before head) */}
          <polygon points="66,262 234,262 150,20" fill="#111" />

          {/* HEAD — white circle on top of hat gives "face inside hat" illusion */}
          <circle cx="150" cy="192" r="54" fill="white" stroke="#111" strokeWidth="3" />

          {/* Eyes */}
          <circle cx="132" cy="189" r="7" fill="#111" />
          <circle cx="168" cy="189" r="7" fill="#111" />
          {/* Eye shine */}
          <circle cx="135" cy="186" r="2.5" fill="white" />
          <circle cx="171" cy="186" r="2.5" fill="white" />

          {/* Hat tip lime orb */}
          <circle cx="150" cy="18" r="14" fill="#C8FF00" stroke="#111" strokeWidth="2.5" />

        </svg>
      </div>
    </div>
  );
}
