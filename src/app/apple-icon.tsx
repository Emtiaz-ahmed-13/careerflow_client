import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f3f3",
        }}
      >
        {/* neo shadow */}
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            background: "#000000",
            transform: "translate(8px, 8px)",
          }}
        />
        <div
          style={{
            width: 140,
            height: 140,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#a3e635",
            border: "5px solid #000000",
            color: "#000000",
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: "-2px" }}>CF</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Flow
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
