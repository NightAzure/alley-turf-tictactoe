import React from "react";

/**
 * Renders the torn-newsprint, halftone dot, and masking-tape street-zine
 * collage background matching the Alley Turf mockup.
 */
export function AlleyCollageBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
    >
      {/* Subtle warm paper fiber grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.045]">
        <filter id="newsprint-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#newsprint-grain)" />
      </svg>

      {/* Bottom-left torn newsprint halftone patch */}
      <div
        className="absolute -left-8 bottom-0 h-[56%] w-[26%] min-w-[140px] max-w-[340px] bg-[#EFE5CA]/80"
        style={{
          clipPath:
            "polygon(0 6%, 48% 12%, 56% 18%, 78% 19%, 82% 38%, 94% 58%, 88% 82%, 96% 100%, 0 100%)",
        }}
      >
        <div className="halftone-dots h-full w-full opacity-55" />
      </div>

      {/* Left vertical masking tape strip */}
      <div
        className="masking-tape absolute left-0 top-[34%] hidden h-44 w-10 sm:block"
        style={{
          transform: "rotate(1.8deg)",
          clipPath:
            "polygon(0 2%, 92% 0, 100% 14%, 94% 35%, 99% 62%, 92% 85%, 98% 100%, 0 98%)",
        }}
      />

      {/* Top-right torn halftone newsprint patch */}
      <div
        className="absolute -right-6 top-0 h-[54%] w-[22%] min-w-[120px] max-w-[300px] bg-[#EFE5CA]/85"
        style={{
          clipPath:
            "polygon(18% 0, 100% 0, 100% 100%, 26% 92%, 14% 72%, 22% 52%, 8% 30%, 20% 14%)",
        }}
      >
        <div className="halftone-dots h-full w-full opacity-60" />
      </div>

      {/* Bottom-right secondary newsprint scrap */}
      <div
        className="absolute -right-4 bottom-0 h-[44%] w-[16%] min-w-[90px] max-w-[230px] bg-[#F2E9D1]/90"
        style={{
          clipPath:
            "polygon(24% 4%, 100% 0, 100% 100%, 8% 100%, 18% 66%, 10% 34%)",
        }}
      >
        <div className="halftone-dots h-full w-full opacity-35" />
      </div>

      {/* Right vertical masking tape strip */}
      <div
        className="masking-tape absolute right-0 top-[37%] hidden h-48 w-11 sm:block"
        style={{
          transform: "rotate(-1.4deg)",
          clipPath:
            "polygon(6% 0, 100% 2%, 100% 98%, 4% 100%, 10% 76%, 2% 48%, 9% 22%)",
        }}
      />
    </div>
  );
}
