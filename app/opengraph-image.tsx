import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RoundYO — Turn spare change into onchain yield";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            💰
          </div>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            Round<span style={{ color: "#818cf8" }}>YO</span>
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "30px",
            color: "#94a3b8",
            textAlign: "center",
            margin: "0 0 48px 0",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Turn spare change into{" "}
          <span style={{ color: "#a5f3a5" }}>onchain yield</span>
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          {[
            { label: "Round-up deposits", icon: "⚡" },
            { label: "Live YO vaults", icon: "🏦" },
            { label: "Goal tracking", icon: "🎯" },
            { label: "Built on Base", icon: "🔵" },
          ].map(({ label, icon }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 20px",
                color: "#e2e8f0",
                fontSize: "18px",
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "#4f4f6f",
          }}
        >
          roundyo.vercel.app
        </p>
      </div>
    ),
    { ...size }
  );
}
