import React from 'react';

interface CardIconProps {
  id: string;
  size?: number;
  color?: string;
  accentColor?: string;
}

/* ── PULSE — ECG heartbeat line ────────────────────── */
function PulseIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      <polyline
        points="2,16 7,16 10,8 13,24 16,11 19,21 22,16 30,16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── TILT — diagonal slanted bar chart ─────────────── */
function TiltIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      <rect x="3" y="22" width="5" height="7" rx="1" fill={color} />
      <rect x="11" y="16" width="5" height="13" rx="1" fill={color} />
      <rect x="19" y="9" width="5" height="20" rx="1" fill={color} />
      <polyline
        points="5.5,21 13.5,15 21.5,8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2,3"
        opacity="0.5"
      />
    </svg>
  );
}

/* ── SURGE — bold upward rocket arrow ──────────────── */
function SurgeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      {/* Arrow shaft */}
      <line x1="16" y1="28" x2="16" y2="8" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Arrowhead */}
      <polyline
        points="9,15 16,5 23,15"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Speed lines */}
      <line x1="10" y1="22" x2="6" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="26" x2="8" y2="26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/* ── SNIPE — crosshair / precision target ──────────── */
function SnipeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      {/* Outer circle */}
      <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="2" />
      {/* Inner circle */}
      <circle cx="16" cy="16" r="5" stroke={color} strokeWidth="2" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill={color} />
      {/* Cross hairs */}
      <line x1="16" y1="2" x2="16" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="23" x2="16" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="16" x2="9" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="16" x2="30" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── WHIPLASH — Z-shaped reversal arrows ────────────── */
function WhiplashIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      {/* Top arrow going right */}
      <polyline
        points="4,8 20,8 14,4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Diagonal connector */}
      <line x1="20" y1="8" x2="12" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom arrow going right */}
      <polyline
        points="12,24 28,24 22,20"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── CALM — flat line with tiny undulation ──────────── */
function CalmIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      {/* Flat baseline */}
      <line x1="2" y1="20" x2="30" y2="20" stroke={color} strokeWidth="1.5" strokeDasharray="2,3" opacity="0.35" />
      {/* Minimal wave */}
      <path
        d="M2,16 Q6,13 10,16 Q14,19 18,16 Q22,13 26,16 Q28,17 30,16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Range zone */}
      <rect x="2" y="12" width="28" height="8" fill={color} opacity="0.07" rx="1" />
    </svg>
  );
}

/* ── Main export ───────────────────────────────────── */
export function CardIcon({ id, size = 24, color = 'currentColor' }: CardIconProps) {
  switch (id) {
    case 'pulse':    return <PulseIcon size={size} color={color} />;
    case 'tilt':     return <TiltIcon size={size} color={color} />;
    case 'surge':    return <SurgeIcon size={size} color={color} />;
    case 'snipe':    return <SnipeIcon size={size} color={color} />;
    case 'whiplash': return <WhiplashIcon size={size} color={color} />;
    case 'calm':     return <CalmIcon size={size} color={color} />;
    default:         return <PulseIcon size={size} color={color} />;
  }
}

/* Map numeric card IDs from constants.ts → icon string IDs */
export const CARD_ICON_ID: Record<number, string> = {
  0: 'pulse',
  1: 'tilt',
  2: 'surge',
  3: 'snipe',
  4: 'whiplash',
  5: 'calm',
};
