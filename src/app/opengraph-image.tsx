import { ImageResponse } from "next/og";

export const alt = "PEPE.PICS — The Ultimate Pepe Gallery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0B0D0B", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#F3F4EC", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="84" height="84" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="31" fill="#A6E56D" />
            <path d="M1.5 38 H62.5 A31 31 0 0 1 1.5 38 Z" fill="#0B0D0B" />
            <circle cx="21.5" cy="30" r="9" fill="#F3F4EC" stroke="#0B0D0B" strokeWidth="2.5" />
            <circle cx="42.5" cy="30" r="9" fill="#F3F4EC" stroke="#0B0D0B" strokeWidth="2.5" />
            <circle cx="24" cy="31" r="3.6" fill="#0B0D0B" />
            <circle cx="45" cy="31" r="3.6" fill="#0B0D0B" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 800, display: "flex" }}>PEPE<span style={{ color: "#A6E56D" }}>.</span>PICS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 800, lineHeight: 0.92, letterSpacing: -4 }}>
          <span>EVERY PEPE</span>
          <span style={{ color: "#A6E56D" }}>HAS A STORY.</span>
        </div>
        <div style={{ fontSize: 30, color: "#92988F" }}>The Internet&apos;s Home for Pepe Art.</div>
      </div>
    ),
    size,
  );
}
