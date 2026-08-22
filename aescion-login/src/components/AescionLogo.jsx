import './AescionLogo.css'

export function AescionMark({ size = 48, className = '' }) {
  return (
    <svg
      viewBox="0 0 200 174"
      width={size}
      height={Math.round(size * (174 / 200))}
      className={`aescion-mark-svg ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Top-Left Blue Triangle: Cyber Security Shield */}
      <polygon points="0,0 100,0 50,86.6" fill="#2516c7" />

      {/* Cyber Circuit Lines around Shield */}
      <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9">
        {/* Left circuit tracks */}
        <path d="M 23,24 H 33 V 30" fill="none" />
        <circle cx="23" cy="24" r="1.5" fill="#ffffff" />
        <path d="M 22,40 H 30 V 46" fill="none" />
        <circle cx="22" cy="40" r="1.5" fill="#ffffff" />
        <path d="M 28,54 H 36" fill="none" />
        <circle cx="28" cy="54" r="1.5" fill="#ffffff" />

        {/* Right circuit tracks */}
        <path d="M 77,24 H 67 V 30" fill="none" />
        <circle cx="77" cy="24" r="1.5" fill="#ffffff" />
        <path d="M 78,40 H 70 V 46" fill="none" />
        <circle cx="78" cy="40" r="1.5" fill="#ffffff" />
        <path d="M 72,54 H 64" fill="none" />
        <circle cx="72" cy="54" r="1.5" fill="#ffffff" />

        {/* Top circuit tracks */}
        <path d="M 44,14 V 20" fill="none" />
        <circle cx="44" cy="14" r="1.5" fill="#ffffff" />
        <path d="M 56,14 V 20" fill="none" />
        <circle cx="56" cy="14" r="1.5" fill="#ffffff" />

        {/* Bottom circuit tracks */}
        <path d="M 44,68 V 62" fill="none" />
        <circle cx="44" cy="68" r="1.5" fill="#ffffff" />
        <path d="M 56,68 V 62" fill="none" />
        <circle cx="56" cy="68" r="1.5" fill="#ffffff" />
      </g>

      {/* Outer concentric circuit arc */}
      <circle
        cx="50"
        cy="40"
        r="23"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeDasharray="4 3 8 3"
        fill="none"
        opacity="0.8"
      />

      {/* Cyber Shield Shape */}
      <path
        d="M 50,22 C 40,22 36,25 36,36 C 36,48 46,54 50,57 C 54,54 64,48 64,36 C 64,25 60,22 50,22 Z"
        stroke="#ffffff"
        strokeWidth="2.4"
        fill="#2516c7"
      />

      {/* Keyhole inside Shield */}
      <circle cx="50" cy="35" r="3.2" fill="#ffffff" />
      <polygon points="48.5,35.5 51.5,35.5 52.5,43 47.5,43" fill="#ffffff" />

      {/* 2. Top-Right Orange Triangle: AI Processor Microchip */}
      <polygon points="100,0 200,0 150,86.6" fill="#fa5b00" />

      {/* Microchip Pins with Nodes */}
      <g stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round">
        {/* Top Pins */}
        <line x1="142" y1="23" x2="142" y2="15" />
        <circle cx="142" cy="14" r="1.8" fill="#ffffff" />
        <line x1="150" y1="23" x2="150" y2="15" />
        <circle cx="150" cy="14" r="1.8" fill="#ffffff" />
        <line x1="158" y1="23" x2="158" y2="15" />
        <circle cx="158" cy="14" r="1.8" fill="#ffffff" />

        {/* Bottom Pins */}
        <line x1="142" y1="57" x2="142" y2="65" />
        <circle cx="142" cy="66" r="1.8" fill="#ffffff" />
        <line x1="150" y1="57" x2="150" y2="65" />
        <circle cx="150" cy="66" r="1.8" fill="#ffffff" />
        <line x1="158" y1="57" x2="158" y2="65" />
        <circle cx="158" cy="66" r="1.8" fill="#ffffff" />

        {/* Left Pins */}
        <line x1="133" y1="32" x2="125" y2="32" />
        <circle cx="124" cy="32" r="1.8" fill="#ffffff" />
        <line x1="133" y1="40" x2="125" y2="40" />
        <circle cx="124" cy="40" r="1.8" fill="#ffffff" />
        <line x1="133" y1="48" x2="125" y2="48" />
        <circle cx="124" cy="48" r="1.8" fill="#ffffff" />

        {/* Right Pins */}
        <line x1="167" y1="32" x2="175" y2="32" />
        <circle cx="176" cy="32" r="1.8" fill="#ffffff" />
        <line x1="167" y1="40" x2="175" y2="40" />
        <circle cx="176" cy="40" r="1.8" fill="#ffffff" />
        <line x1="167" y1="48" x2="175" y2="48" />
        <circle cx="176" cy="48" r="1.8" fill="#ffffff" />
      </g>

      {/* Chip Box */}
      <rect x="133" y="23" width="34" height="34" rx="4" stroke="#ffffff" strokeWidth="2.4" fill="#fa5b00" />
      {/* "AI" Text */}
      <text
        x="150"
        y="47"
        fontFamily="'Segoe UI', Poppins, Inter, sans-serif"
        fontWeight="800"
        fontSize="17"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        AI
      </text>

      {/* 3. Center White Triangle: Blue Graduation Cap */}
      <polygon points="100,0 150,86.6 50,86.6" fill="#ffffff" />

      {/* Graduation Cap (Dark Blue) */}
      <g fill="#2516c7">
        {/* Diamond Top Cap */}
        <polygon points="100,28 132,42 100,56 68,42" />
        {/* Under cap band */}
        <path d="M 80,48 L 80,60 C 80,68 120,68 120,60 L 120,48 Z" />
        {/* Tassel */}
        <path
          d="M 124,42.5 L 133,46.5 L 133,63"
          fill="none"
          stroke="#2516c7"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="42" r="2.5" fill="#ffffff" />
      </g>

      {/* 4. Bottom Charcoal Triangle: Smart Computer Monitor with WiFi */}
      <polygon points="50,86.6 150,86.6 100,173.2" fill="#333333" />

      {/* Monitor Display */}
      <rect x="73" y="96" width="54" height="34" rx="3.5" stroke="#ffffff" strokeWidth="2.4" fill="#333333" />

      {/* Monitor Stand */}
      <path d="M 94,130 L 106,130 L 107,136 L 93,136 Z" fill="#ffffff" />
      <rect x="85" y="136" width="30" height="2.5" rx="1.2" fill="#ffffff" />

      {/* WiFi Waves inside Monitor */}
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        {/* Signal Dot */}
        <circle cx="100" cy="120" r="1.8" fill="#ffffff" stroke="none" />
        {/* Wave 1 */}
        <path d="M 95,116 A 6.5 6.5 0 0 1 105,116" strokeWidth="1.8" />
        {/* Wave 2 */}
        <path d="M 91,112 A 12 12 0 0 1 109,112" strokeWidth="1.8" />
        {/* Wave 3 */}
        <path d="M 87,108 A 17 17 0 0 1 113,108" strokeWidth="1.8" />
        {/* Wave 4 */}
        <path d="M 83,104 A 22 22 0 0 1 117,104" strokeWidth="1.8" />
      </g>
    </svg>
  )
}

export default function AescionLogo({ size = 'default', markSize }) {
  const defaultMarkSize = size === 'small' ? 36 : size === 'large' ? 64 : 50
  const resolvedSize = markSize ?? defaultMarkSize

  return (
    <div className={`aescion-logo aescion-logo--${size}`}>
      <AescionMark size={resolvedSize} />

      <div className="aescion-wordmark">
        <h1 className="aescion-wordmark__title">
          <span className="aescion-wordmark__orange">AES</span>
          <span className="aescion-wordmark__navy">CION</span>
        </h1>
        <p className="aescion-wordmark__subtitle">EDTECH SOLUTIONS</p>
      </div>
    </div>
  )
}


