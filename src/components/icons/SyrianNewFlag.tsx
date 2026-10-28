import React from 'react';

interface SyrianNewFlagProps {
  className?: string;
  title?: string;
}

/**
 * High-fidelity SVG of the New Syrian Flag (علم الاستقلال السوري / علم الثورة السورية)
 * Tricolor: Green (top), White (middle with 3 red stars), Black (bottom)
 */
export default function SyrianNewFlag({ className = 'w-5 h-3.5', title = 'علم سوريا الجديد' }: SyrianNewFlagProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={`inline-block align-middle shrink-0 rounded-xs shadow-xs border border-black/10 dark:border-white/10 ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Top Stripe: Green */}
      <rect x="0" y="0" width="36" height="8" fill="#007a3d" />

      {/* Middle Stripe: White */}
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />

      {/* Bottom Stripe: Black */}
      <rect x="0" y="16" width="36" height="8" fill="#18181b" />

      {/* 3 Red 5-pointed stars in the middle white band */}
      {/* Star 1 (Right in LTR coords / Left in visual space: x=10) */}
      <polygon
        points="10,9.5 10.7,11.2 12.5,11.3 11.1,12.5 11.6,14.2 10,13.1 8.4,14.2 8.9,12.5 7.5,11.3 9.3,11.2"
        fill="#dc2626"
      />

      {/* Star 2 (Center: x=18) */}
      <polygon
        points="18,9.5 18.7,11.2 20.5,11.3 19.1,12.5 19.6,14.2 18,13.1 16.4,14.2 16.9,12.5 15.5,11.3 17.3,11.2"
        fill="#dc2626"
      />

      {/* Star 3 (Left in LTR coords / Right in visual space: x=26) */}
      <polygon
        points="26,9.5 26.7,11.2 28.5,11.3 27.1,12.5 27.6,14.2 26,13.1 24.4,14.2 24.9,12.5 23.5,11.3 25.3,11.2"
        fill="#dc2626"
      />
    </svg>
  );
}
