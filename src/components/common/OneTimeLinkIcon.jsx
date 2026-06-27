/** View-once style icon — solid arc + arrow + dotted arc + "1" (WhatsApp-like) */

function polar(clockDeg, radius = 8, cx = 12, cy = 12) {
  const rad = (clockDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
  };
}

function arrowHead(clockDeg, radius = 8, cx = 12, cy = 12) {
  const tip = polar(clockDeg, radius, cx, cy);
  const wing1 = polar(clockDeg - 18, radius - 2.2, cx, cy);
  const wing2 = polar(clockDeg + 10, radius - 2.6, cx, cy);
  return `M ${wing1.x} ${wing1.y} L ${tip.x} ${tip.y} L ${wing2.x} ${wing2.y} Z`;
}

export default function OneTimeLinkIcon() {
  const r = 8;
  const arcStart = polar(236, r);
  const arcEnd = polar(86, r);
  const dots = [112, 140, 168, 196, 224].map((deg) => polar(deg, r));

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path d={arrowHead(86, r)} fill="currentColor" />
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r="1.15"
          fill="currentColor"
        />
      ))}
      <text
        x="12"
        y="12.6"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="10"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        1
      </text>
    </svg>
  );
}
