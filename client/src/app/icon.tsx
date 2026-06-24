import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        <div
          style={{
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#a3e635",
            border: "3px solid #000000",
            fontSize: 11,
            fontWeight: 900,
            color: "#000000",
            letterSpacing: "-0.5px",
          }}
        >
          CF
        </div>
      </div>
    ),
    { ...size },
  );
}
