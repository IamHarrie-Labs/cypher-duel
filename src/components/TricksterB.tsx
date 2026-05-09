import React from 'react';

/* CSS injected once for TricksterB animations */
const CSS = `
@keyframes tb-float { 0%,100%{transform:translateY(-4px)} 50%{transform:translateY(10px)} }
@keyframes tb-spark1 { 0%,100%{opacity:0;transform:scale(0.3)} 45%{opacity:1;transform:scale(1)} }
@keyframes tb-spark2 { 0%,100%{opacity:0;transform:scale(0.3)} 55%{opacity:1;transform:scale(1)} }
@keyframes tb-wand   { 0%,100%{opacity:0.7;transform:rotate(-5deg)} 50%{opacity:1;transform:rotate(5deg)} }
@keyframes tb-shadow { 0%,100%{transform:scaleX(1);opacity:0.15} 50%{transform:scaleX(0.8);opacity:0.07} }
`;
if (typeof document !== 'undefined' && !document.getElementById('tb-css')) {
  const s = document.createElement('style');
  s.id = 'tb-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ───────────────────────────────────────────────────
   TRICKSTER B — The Rival / The Aggressor
   Spiky crown · winking face · raised wand arm
   Mirrored for hero section (right player)
   Distinct from A: no hat, arm raised, pink accents
─────────────────────────────────────────────────── */
export default function TricksterB() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Floating wrapper — inverse phase from A */}
      <div style={{ animation: 'tb-float 3.2s ease-in-out infinite' }}>
        <svg viewBox="0 0 300 450" width="240" style={{ overflow: 'visible' }}>

          {/* Ground shadow */}
          <ellipse
            cx="150" cy="442" rx="68" ry="8"
            fill="#111" style={{ animation: 'tb-shadow 3.2s ease-in-out infinite' }}
          />

          {/* Floating particles — lime on right side */}
          <circle cx="248" cy="220" r="7" fill="#C8FF00"
            style={{ animation: 'tb-spark1 2.6s ease-in-out 0.3s infinite' }} />
          <circle cx="258" cy="290" r="5" fill="#FF2D78"
            style={{ animation: 'tb-spark2 2.6s ease-in-out 1.1s infinite' }} />
          <circle cx="240" cy="360" r="3.5" fill="#C8FF00"
            style={{ animation: 'tb-spark1 2.6s ease-in-out 1.8s infinite' }} />

          {/* Body — white trapezoid (slightly narrower) */}
          <polygon
            points="100,268 200,268 238,422 62,422"
            fill="white" stroke="#111" strokeWidth="3"
          />
          {/* Pink accent belt stripe */}
          <polygon
            points="100,268 200,268 206,290 94,290"
            fill="#FF2D78" stroke="#111" strokeWidth="2"
          />
          {/* Center dashed line on robe */}
          <line
            x1="150" y1="290" x2="150" y2="418"
            stroke="#ccc" strokeWidth="1.5" strokeDasharray="9,7"
          />

          {/* Raised right arm — line art */}
          <line x1="196" y1="272" x2="250" y2="195"
            stroke="#111" strokeWidth="6" strokeLinecap="round" />
          <line x1="250" y1="195" x2="286" y2="142"
            stroke="#111" strokeWidth="5" strokeLinecap="round" />

          {/* Wand with glowing tip */}
          <g style={{ animation: 'tb-wand 2s ease-in-out infinite', transformOrigin: '286px 142px' }}>
            <circle cx="286" cy="130" r="12" fill="#C8FF00" stroke="#111" strokeWidth="2.5" />
            <circle cx="286" cy="130" r="6" fill="white" opacity="0.8" />
          </g>

          {/* HEAD — white circle */}
          <circle cx="150" cy="205" r="52" fill="white" stroke="#111" strokeWidth="3" />

          {/* Short cropped hair — dark fill across top of head */}
          <path
            d="M 103,200 Q 108,160 150,158 Q 192,160 197,200 Q 185,175 150,172 Q 115,175 103,200 Z"
            fill="#111"
          />

          {/* Face — LEFT eye winking (curved arc) */}
          <path
            d="M 126,204 Q 136,195 146,204"
            fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round"
          />
          {/* Face — RIGHT eye normal (dot) */}
          <circle cx="170" cy="202" r="7.5" fill="#111" />
          {/* Eye shine on right eye */}
          <circle cx="173" cy="199" r="2.5" fill="white" />

          {/* Mouth — confident smirk */}
          <path
            d="M 138,224 Q 152,234 165,224"
            fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"
          />

        </svg>
      </div>
    </div>
  );
}
