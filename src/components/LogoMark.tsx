import React from 'react';

/**
 * Original Cypher logo — lime green square with bold X, plus "CYPHER _" wordmark.
 */
export function LogoMark({ height = 38 }: { height?: number }) {
  // viewBox: 160×40 — square icon + wordmark side by side
  const w = height * 4;
  return (
    <svg
      viewBox="0 0 160 40"
      height={height}
      width={w}
      aria-label="Cypher"
      style={{ display: 'block', flexShrink: 0, userSelect: 'none', pointerEvents: 'none' }}
    >
      {/* Lime green square */}
      <rect x="0" y="0" width="40" height="40" fill="#C8FF00" />
      {/* Bold X — two crossing strokes */}
      <line x1="9" y1="9" x2="31" y2="31" stroke="#111" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="31" y1="9" x2="9" y2="31" stroke="#111" strokeWidth="5.5" strokeLinecap="round" />

      {/* CYPHER _ wordmark */}
      <text
        x="52"
        y="30"
        fontFamily="'Space Grotesk', 'JetBrains Mono', sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#111"
        letterSpacing="1"
      >
        CYPHER _
      </text>
    </svg>
  );
}
