export default function DiskDriveLogo({ size = 32, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Disk Drive"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="dd-brand" x1="8" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="0.55" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="dd-shine" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#C7D2FE" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient
          id="dd-core"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(32 33) rotate(90) scale(14)"
        >
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#3B82F6" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="#0F172A" />
      <rect
        x="4.75"
        y="4.75"
        width="54.5"
        height="54.5"
        rx="14.25"
        stroke="url(#dd-brand)"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <circle
        cx="32"
        cy="33"
        r="15.5"
        stroke="url(#dd-brand)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="33" r="10.5" fill="url(#dd-core)" />
      <ellipse
        cx="28"
        cy="28.5"
        rx="5"
        ry="3.2"
        fill="url(#dd-shine)"
        transform="rotate(-18 28 28.5)"
      />
      <circle cx="32" cy="33" r="3.6" fill="#0F172A" />
      <circle cx="32" cy="33" r="2.2" fill="#F8FAFC" fillOpacity="0.92" />
      <path
        d="M44 17.5H50.5V24"
        stroke="#34D399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50.5 17.5L42.5 25.5"
        stroke="#60A5FA"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
