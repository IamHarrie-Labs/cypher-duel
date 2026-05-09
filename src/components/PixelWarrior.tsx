import React from 'react';

/* CSS keyframes injected once at module load */
const CSS = `
@keyframes pw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes pw-eye   { 0%,100%{opacity:0.65} 50%{opacity:1} }
@keyframes pw-sword { 0%,100%{opacity:0.82} 50%{opacity:1} }
@keyframes pw-shadow{ 0%,100%{transform:scaleX(1);opacity:0.3} 50%{transform:scaleX(0.82);opacity:0.15} }
@keyframes pw-spark { 0%,100%{opacity:0;r:2} 50%{opacity:0.8;r:5} }
`;
if (typeof document !== 'undefined' && !document.getElementById('pw-css')) {
  const s = document.createElement('style');
  s.id = 'pw-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ───────────────────────────────────────────────────────────────
   PIXEL WARRIOR — SVG-based fighting-game character
   Neo-brutalist duelist with animated glowing sword + eyes
─────────────────────────────────────────────────────────────── */

export default function PixelWarrior() {
  return (
    <div className="relative w-full h-full flex items-end justify-center select-none">

      {/* Ambient glow behind character */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 55% 60%, rgba(204,255,0,0.09) 0%, transparent 70%)',
        }}
      />

      {/* Floating body — CSS animation, compositor thread */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'pw-float 3.2s ease-in-out infinite' }}>
        <svg
          viewBox="0 0 580 400"
          width="100%"
          style={{ maxWidth: 560, overflow: 'visible' }}
        >
          <defs>
            {/* Sword glow */}
            <filter id="pw-sword-glow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Eye glow */}
            <filter id="pw-eye-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Body edge glow */}
            <filter id="pw-body-glow" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── HELMET ── */}
          {/* Main helmet top ridge */}
          <polygon points="155,18 175,0 195,0 215,18" fill="#CCFF00" />
          {/* Helmet dome */}
          <polygon points="100,74 270,74 258,44 220,20 150,20 112,44" fill="#CCFF00" />
          {/* Helmet side bolts */}
          <rect x="96" y="56" width="10" height="10" fill="#111" />
          <rect x="264" y="56" width="10" height="10" fill="#111" />

          {/* ── VISOR ── */}
          <rect x="96" y="74" width="178" height="42" fill="#0A0A0A" />
          {/* Visor edge trim */}
          <rect x="96" y="74" width="178" height="3" fill="#CCFF00" opacity="0.4" />
          <rect x="96" y="113" width="178" height="3" fill="#CCFF00" opacity="0.3" />
          {/* Left eye */}
          <g filter="url(#pw-eye-glow)" style={{ animation: 'pw-eye 1.3s ease-in-out infinite' }}>
            <rect x="112" y="82" width="32" height="22" fill="#FF3B3B" />
            <rect x="116" y="86" width="10" height="6" fill="#FF8080" opacity="0.6" />
          </g>
          {/* Right eye */}
          <g filter="url(#pw-eye-glow)" style={{ animation: 'pw-eye 1.3s ease-in-out 0.18s infinite' }}>
            <rect x="226" y="82" width="32" height="22" fill="#FF3B3B" />
            <rect x="230" y="86" width="10" height="6" fill="#FF8080" opacity="0.6" />
          </g>
          {/* Nose bridge */}
          <rect x="179" y="82" width="12" height="22" fill="#0A0A0A" />

          {/* ── CHIN / LOWER FACE ── */}
          <polygon points="100,116 270,116 262,134 108,134" fill="#CCFF00" />

          {/* ── NECK ── */}
          <rect x="152" y="134" width="66" height="26" fill="#CCFF00" />

          {/* ── WIDE SHOULDER PLATES ── */}
          <polygon points="48,160 322,160 314,170 56,170" fill="#CCFF00" />
          {/* Left pauldron */}
          <polygon points="48,145 96,145 98,178 48,174" fill="#CCFF00" />
          <rect x="48" y="145" width="48" height="5" fill="rgba(0,0,0,0.3)" />
          {/* Right pauldron */}
          <polygon points="272,145 322,145 322,174 270,178" fill="#CCFF00" />
          <rect x="274" y="145" width="48" height="5" fill="rgba(0,0,0,0.3)" />

          {/* ── CHEST / TORSO ── */}
          <polygon points="58,170 312,170 300,262 70,262" fill="#CCFF00" />
          {/* Central chest armor stripe */}
          <rect x="161" y="170" width="48" height="92" fill="#111111" />
          {/* Chest wing-lines */}
          <polygon points="58,170 130,170 105,230 62,222" fill="rgba(0,0,0,0.18)" />
          <polygon points="312,170 240,170 265,230 308,222" fill="rgba(0,0,0,0.18)" />
          {/* Chest rivet details */}
          <rect x="96" y="192" width="12" height="12" fill="#0A0A0A" />
          <rect x="260" y="192" width="12" height="12" fill="#0A0A0A" />
          <rect x="96" y="220" width="12" height="12" fill="#0A0A0A" />
          <rect x="260" y="220" width="12" height="12" fill="#0A0A0A" />

          {/* ── LEFT ARM (at side) ── */}
          <polygon points="48,162 78,163 74,252 44,248" fill="#CCFF00" />
          {/* Left fist */}
          <rect x="32" y="242" width="50" height="36" fill="#CCFF00" />
          <rect x="32" y="242" width="50" height="6" fill="rgba(0,0,0,0.25)" />

          {/* ── RIGHT ARM (extended → sword) ── */}
          <polygon points="290,162 322,164 328,196 290,193" fill="#CCFF00" />
          {/* Forearm shoots right */}
          <polygon points="322,168 370,165 373,188 318,192" fill="#CCFF00" />
          {/* Gauntlet */}
          <rect x="366" y="158" width="44" height="38" fill="#CCFF00" />
          {/* Knuckle plates */}
          <rect x="372" y="158" width="10" height="10" fill="#111" />
          <rect x="386" y="158" width="10" height="10" fill="#111" />
          <rect x="400" y="158" width="10" height="10" fill="#111" />

          {/* ── BELT ── */}
          <rect x="66" y="258" width="238" height="22" fill="#111111" />
          {/* Buckle */}
          <rect x="157" y="259" width="56" height="20" fill="#CCFF00" />
          <rect x="165" y="263" width="40" height="12" fill="#111" />
          <rect x="175" y="266" width="20" height="6" fill="#CCFF00" />

          {/* ── UPPER LEGS ── */}
          <polygon points="70,280 168,280 165,358 68,358" fill="#CCFF00" />
          <polygon points="202,280 300,280 300,358 206,358" fill="#CCFF00" />
          {/* Knee guards */}
          <rect x="80" y="312" width="72" height="18" fill="#111111" />
          <rect x="214" y="312" width="70" height="18" fill="#111111" />

          {/* ── BOOTS ── */}
          <rect x="56" y="352" width="118" height="38" fill="#111111" />
          <rect x="196" y="352" width="116" height="38" fill="#111111" />
          {/* Boot toe chrome */}
          <rect x="56" y="380" width="118" height="10" fill="#1a1a1a" />
          <rect x="196" y="380" width="116" height="10" fill="#1a1a1a" />

          {/* ── SWORD ── */}
          {/* Pommel (bottom of handle) */}
          <rect x="404" y="166" width="20" height="26" fill="#888" />
          {/* Handle wrap */}
          <rect x="420" y="158" width="38" height="42" fill="#666" />
          <rect x="422" y="164" width="6" height="30" fill="#888" />
          <rect x="432" y="164" width="6" height="30" fill="#888" />
          <rect x="442" y="164" width="6" height="30" fill="#888" />
          {/* Cross guard */}
          <rect x="456" y="148" width="18" height="60" fill="#999" />
          <rect x="458" y="148" width="14" height="4" fill="#BBB" />
          <rect x="458" y="204" width="14" height="4" fill="#BBB" />

          {/* Glowing blade */}
          <g filter="url(#pw-sword-glow)" style={{ animation: 'pw-sword 1.8s ease-in-out infinite' }}>
            {/* Blade body */}
            <polygon
              points="472,162 570,167 570,175 472,175"
              fill="#F5F5F0"
            />
            {/* Extended blade */}
            <polygon
              points="568,162 568,178 570,175 570,167"
              fill="#DDD"
            />
            {/* Tip */}
            <polygon points="568,162 570,167 570,175 568,178 590,169" fill="#F5F5F0" />
            {/* Lime edge — the glowing edge */}
            <polygon
              points="472,162 570,167 570,163 472,159"
              fill="#CCFF00"
              opacity="0.9"
            />
            {/* Blade fuller (center groove glow) */}
            <polygon
              points="472,168 565,170 565,172 472,171"
              fill="#CCFF00"
              opacity="0.35"
            />
          </g>

          {/* ── ENERGY PARTICLES (CSS animations) ── */}
          {[
            { cx: 310, cy: 130, delay: '0s' },
            { cx: 340, cy: 110, delay: '0.4s' },
            { cx: 290, cy: 95,  delay: '0.8s' },
            { cx: 328, cy: 152, delay: '1.2s' },
            { cx: 355, cy: 98,  delay: '0.6s' },
          ].map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={4}
              fill="#CCFF00"
              style={{ animation: `pw-spark 2.2s ease-in-out ${p.delay} infinite`, transformOrigin: `${p.cx}px ${p.cy}px` }}
            />
          ))}
        </svg>
      </div>

      {/* Ground shadow — CSS animation */}
      <div
        className="absolute bottom-2 left-1/2"
        style={{
          width: 240,
          height: 18,
          marginLeft: -120,
          background: 'radial-gradient(ellipse, #CCFF00 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(8px)',
          animation: 'pw-shadow 3.2s ease-in-out infinite',
        }}
      />
    </div>
  );
}
