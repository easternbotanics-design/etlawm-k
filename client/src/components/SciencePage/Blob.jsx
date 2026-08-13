import { useState } from "react";

export function BlobEffect({
  size = 300,
  borderColor = "#a9ff68",
  hoverColors = ["#d76bb1", "#f192d0", "#f06ec292"],
  speeds = [5, 4, 10],
  hoverEnabled = true,
  className = "",
}) {

  const borderRadius = "38% 62% 63% 37% / 41% 44% 56% 59%";
  const active = hoverEnabled;

  const spanStyle = (i, direction) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    transition: "0.5s",
    animation: `blob-rotate-${direction} ${speeds[i]}s linear infinite`,
    border: active ? "none" : `2px solid ${borderColor}`,
    background: active ? hoverColors[i] : "transparent",
  });

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes blob-rotate-forward {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blob-rotate-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <span style={spanStyle(0, "forward")} />
      <span style={spanStyle(1, "forward")} />
      <span style={spanStyle(2, "reverse")} />
    </div>
  );
}

export default function App() {
  return (
    <div className="grid place-items-center h-screen bg-[#17181c]">
      <BlobEffect />
    </div>
  );
}