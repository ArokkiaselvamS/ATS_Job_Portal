import { motion } from 'framer-motion'
import './HeroIllustration.css'

export default function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <svg viewBox="0 0 680 540" className="hero-illustration__svg">
        <defs>
          {/* Paper Texture Filter & Patterns */}
          <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5D9C8" />
            <stop offset="100%" stopColor="#D5C5AE" />
          </linearGradient>

          <linearGradient id="lampGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE082" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#FFECB3" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="laptopScreenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAFAFF" />
            <stop offset="100%" stopColor="#F4F5FD" />
          </linearGradient>

          <filter id="sketchShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#1C2440" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* ---------- Background Room Sketch ---------- */}
        <g className="room-sketch" opacity="0.45" stroke="#A8B4D0" strokeWidth="1.2" strokeLinecap="round">
          {/* Wall window on top right */}
          <rect x="460" y="20" width="180" height="240" fill="none" strokeWidth="1.8" rx="2" />
          <line x1="460" y1="120" x2="640" y2="120" strokeWidth="1.4" />
          <line x1="550" y1="20" x2="550" y2="260" strokeWidth="1.4" />
          {/* Diagonal sunlight hatching in window */}
          <line x1="470" y1="30" x2="530" y2="90" opacity="0.5" />
          <line x1="500" y1="30" x2="540" y2="70" opacity="0.5" />
          <line x1="560" y1="30" x2="620" y2="90" opacity="0.5" />
          {/* Bookshelf sketch on wall left */}
          <line x1="30" y1="140" x2="220" y2="140" strokeWidth="1.6" />
          <line x1="30" y1="70" x2="220" y2="70" strokeWidth="1.6" />
          <rect x="50" y="85" width="14" height="55" fill="none" strokeWidth="1.2" />
          <rect x="67" y="92" width="12" height="48" fill="none" strokeWidth="1.2" />
          <rect x="82" y="78" width="16" height="62" fill="none" strokeWidth="1.2" />
          <rect x="150" y="98" width="40" height="42" fill="none" rx="3" strokeWidth="1.2" />
        </g>

        {/* ---------- Wooden Desk Surface ---------- */}
        <rect x="0" y="445" width="680" height="95" fill="url(#deskGrad)" />
        <line x1="0" y1="445" x2="680" y2="445" stroke="#C2AF94" strokeWidth="2.5" />
        {/* Wood grain pencil strokes */}
        <path d="M 40,470 Q 200,468 400,472" fill="none" stroke="#C7B69B" strokeWidth="1" opacity="0.6" />
        <path d="M 280,500 Q 480,496 640,502" fill="none" stroke="#C7B69B" strokeWidth="1" opacity="0.6" />

        {/* ---------- Lamp Light Cone Overlay ---------- */}
        <path d="M 95,200 L 480,480 L 10,480 Z" fill="url(#lampGlow)" pointerEvents="none" />

        {/* ---------- Desk Lamp (Left) ---------- */}
        <motion.g
          className="desk-lamp"
          animate={{ rotate: [-0.5, 0.5, -0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 445px" }}
        >
          {/* Base */}
          <ellipse cx="60" cy="445" rx="30" ry="8" fill="#334155" stroke="#1E293B" strokeWidth="2" />
          <ellipse cx="60" cy="443" rx="22" ry="5" fill="#475569" />
          {/* Arm segments */}
          <path d="M 60,443 L 52,340 L 95,200" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="340" r="5" fill="#64748B" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="95" cy="200" r="5" fill="#64748B" stroke="#1E293B" strokeWidth="1.5" />
          {/* Shade */}
          <path d="M 70,185 C 65,160 115,160 125,185 L 135,215 L 60,205 Z" fill="#334155" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
          {/* Bulb glowing inside */}
          <circle cx="95" cy="205" r="12" fill="#FDE047" opacity="0.9" />
        </motion.g>

        {/* ---------- Stack of Books (Left) ---------- */}
        <g className="book-stack" filter="url(#sketchShadow)">
          {/* Bottom Book (Purple) */}
          <g transform="rotate(-1 90 425)">
            <rect x="25" y="412" width="145" height="26" rx="3" fill="#6D28D9" stroke="#4C1D95" strokeWidth="1.8" />
            <rect x="165" y="415" width="8" height="20" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="30" y1="425" x2="160" y2="425" stroke="#8B5CF6" strokeWidth="1.5" />
          </g>
          {/* Middle Book (Orange) */}
          <g transform="rotate(1.5 90 395)">
            <rect x="28" y="386" width="138" height="25" rx="3" fill="#EA580C" stroke="#C2410C" strokeWidth="1.8" />
            <rect x="161" y="389" width="8" height="19" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="34" y1="398" x2="155" y2="398" stroke="#FB923C" strokeWidth="1.5" />
          </g>
          {/* Top Book (Blue) */}
          <g transform="rotate(-2 90 365)">
            <rect x="22" y="360" width="142" height="25" rx="3" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1.8" />
            <rect x="159" y="363" width="8" height="19" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="28" y1="372" x2="152" y2="372" stroke="#3B82F6" strokeWidth="1.5" />
            {/* Bookmark ribbon hanging out */}
            <path d="M 120,385 L 120,410 L 126,404 L 132,410 L 132,385 Z" fill="#EF4444" />
          </g>
        </g>

        {/* ---------- Open Spiral Notebook (Front Left) ---------- */}
        <g className="open-notebook" transform="translate(15, 435)" filter="url(#sketchShadow)">
          {/* Pages shadow base */}
          <polygon points="5,0 185,5 180,90 0,85" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Left Page */}
          <polygon points="8,2 90,4 88,86 4,83" fill="#FFFDF8" stroke="#D1D5DB" strokeWidth="1.2" />
          {/* Right Page */}
          <polygon points="90,4 182,7 177,88 88,86" fill="#FFFDF8" stroke="#D1D5DB" strokeWidth="1.2" />
          {/* Spiral binding rings */}
          {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map((x, i) => (
            <ellipse key={i} cx={x} cy="4" rx="2.5" ry="4.5" fill="#475569" stroke="#1E293B" strokeWidth="1" />
          ))}

          {/* Left Page Content: Lightbulb sketch */}
          <g transform="translate(20, 20)">
            <circle cx="24" cy="22" r="14" fill="#FEF08A" stroke="#EAB308" strokeWidth="1.8" />
            <path d="M 20,34 L 28,34 L 26,40 L 22,40 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
            {/* Bulb rays */}
            <line x1="24" y1="3" x2="24" y2="0" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="7" y1="12" x2="4" y2="10" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="41" y1="12" x2="44" y2="10" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="6" y1="28" x2="2" y2="30" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="42" y1="28" x2="46" y2="30" stroke="#EAB308" strokeWidth="1.8" />
          </g>

          {/* Right Page Content: LEARN GROW ACHIEVE */}
          <g transform="translate(100, 18)">
            <text x="0" y="16" fontFamily="'Architects Daughter', cursive, sans-serif" fontWeight="bold" fontSize="15" fill="#1D4ED8" letterSpacing="1">LEARN</text>
            <text x="0" y="38" fontFamily="'Architects Daughter', cursive, sans-serif" fontWeight="bold" fontSize="15" fill="#EA580C" letterSpacing="1">GROW</text>
            <text x="0" y="60" fontFamily="'Architects Daughter', cursive, sans-serif" fontWeight="bold" fontSize="15" fill="#7C3AED" letterSpacing="1">ACHIEVE</text>

            {/* Sparkle stars */}
            <path d="M 68,52 L 70,57 L 75,57 L 71,60 L 73,65 L 68,62 L 63,65 L 65,60 L 61,57 L 66,57 Z" fill="#EAB308" />
            <path d="M 62,30 L 63,33 L 66,33 L 64,35 L 65,38 L 62,36 L 59,38 L 60,35 L 58,33 L 61,33 Z" fill="#EAB308" transform="scale(0.7) translate(30,0)" />
          </g>
        </g>

        {/* ---------- Ballpoint Pen (Front Center) ---------- */}
        <g transform="rotate(-18 310 495)" filter="url(#sketchShadow)">
          {/* Pen body */}
          <rect x="230" y="492" width="135" height="8" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          {/* Silver barrel accent */}
          <rect x="230" y="492" width="30" height="8" rx="4" fill="#94A3B8" />
          {/* Clip */}
          <rect x="240" y="489" width="18" height="3" fill="#64748B" />
          {/* Tip */}
          <polygon points="365,492 376,496 365,500" fill="#475569" />
          <polygon points="373,495 376,496 373,497" fill="#1E293B" />
        </g>

        {/* ---------- Laptop Workspace (Center) ---------- */}
        <motion.g
          className="laptop-workspace"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Laptop Base & Keyboard Deck */}
          <polygon points="210,440 500,440 535,482 175,482" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="225,444 485,444 515,476 195,476" fill="#1E293B" opacity="0.85" />
          {/* Trackpad */}
          <rect x="325" y="458" width="60" height="16" rx="3" fill="#9CA3AF" opacity="0.6" stroke="#6B7280" strokeWidth="1" />

          {/* Laptop Screen Frame */}
          <rect x="215" y="215" width="280" height="225" rx="12" fill="#1E293B" stroke="#0F172A" strokeWidth="3" filter="url(#sketchShadow)" />
          {/* Web camera dot */}
          <circle cx="355" cy="223" r="2.5" fill="#475569" />

          {/* Screen Inner Display */}
          <rect x="227" y="232" width="256" height="196" rx="6" fill="url(#laptopScreenGrad)" />

          {/* Dashboard Header Bar */}
          <rect x="227" y="232" width="256" height="24" fill="#F1F5F9" />
          <line x1="227" y1="256" x2="483" y2="256" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="240" cy="244" r="3" fill="#EF4444" />
          <circle cx="250" cy="244" r="3" fill="#F59E0B" />
          <circle cx="260" cy="244" r="3" fill="#10B981" />
          {/* Search bar inside laptop dashboard */}
          <rect x="365" y="237" width="105" height="14" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

          {/* Dashboard Sidebar */}
          <rect x="227" y="256" width="30" height="172" fill="#4F46E5" />
          <circle cx="242" cy="272" r="7" fill="#FFFFFF" opacity="0.9" />
          <rect x="235" y="290" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.8" />
          <rect x="235" y="302" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.5" />
          <rect x="235" y="314" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.5" />
          <rect x="235" y="326" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.5" />

          {/* Top Row Dashboard Cards */}
          {/* Card 1: Student Cap */}
          <g transform="translate(267, 268)">
            <rect x="0" y="0" width="62" height="48" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.2" />
            <rect x="8" y="8" width="20" height="20" rx="5" fill="#4F46E5" />
            <path d="M 18,13 L 24,16 L 18,19 L 12,16 Z" fill="#FFFFFF" />
            <path d="M 14,18 L 14,22 C 14,23 22,23 22,22 L 22,18" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            <rect x="8" y="33" width="36" height="4" rx="2" fill="#818CF8" />
          </g>

          {/* Card 2: AI Tech */}
          <g transform="translate(337, 268)">
            <rect x="0" y="0" width="62" height="48" rx="8" fill="#FFF7ED" stroke="#FFEDD5" strokeWidth="1.2" />
            <rect x="8" y="8" width="20" height="20" rx="5" fill="#EA580C" />
            <text x="18" y="23" fontFamily="sans-serif" fontWeight="bold" fontSize="10" fill="#FFFFFF" textAnchor="middle">AI</text>
            <rect x="8" y="33" width="40" height="4" rx="2" fill="#FDBA74" />
          </g>

          {/* Card 3: Courses Book */}
          <g transform="translate(407, 268)">
            <rect x="0" y="0" width="64" height="48" rx="8" fill="#F3E8FF" stroke="#E9D5FF" strokeWidth="1.2" />
            <rect x="8" y="8" width="20" height="20" rx="5" fill="#7C3AED" />
            <path d="M 13,14 H 23 V 22 H 13 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="18" y1="14" x2="18" y2="22" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="8" y="33" width="34" height="4" rx="2" fill="#C084FC" />
          </g>

          {/* Bottom Left: Bar Chart Section */}
          <g transform="translate(267, 330)">
            <rect x="0" y="0" width="100" height="86" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
            <line x1="12" y1="72" x2="90" y2="72" stroke="#CBD5E1" strokeWidth="1" />
            {/* Grid lines */}
            <line x1="12" y1="54" x2="90" y2="54" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="12" y1="36" x2="90" y2="36" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2,2" />
            {/* Animated Bars */}
            <rect x="18" y="42" width="10" height="30" rx="2" fill="#2563EB" />
            <rect x="32" y="28" width="10" height="44" rx="2" fill="#4F46E5" />
            <rect x="46" y="50" width="10" height="22" rx="2" fill="#94A3B8" />
            <rect x="60" y="20" width="10" height="52" rx="2" fill="#EA580C" />
            <rect x="74" y="35" width="10" height="37" rx="2" fill="#06B6D4" />
          </g>

          {/* Bottom Right: Donut Chart Section */}
          <g transform="translate(377, 330)">
            <rect x="0" y="0" width="94" height="86" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
            <g transform="translate(47, 43)">
              {/* Donut slices */}
              <circle r="30" fill="#EEF2FF" />
              <path d="M 0,0 L 0,-30 A 30,30 0 0 1 26,-15 Z" fill="#4F46E5" />
              <path d="M 0,0 L 26,-15 A 30,30 0 0 1 18,24 Z" fill="#EA580C" />
              <path d="M 0,0 L 18,24 A 30,30 0 0 1 -24,18 Z" fill="#2563EB" />
              <path d="M 0,0 L -24,18 A 30,30 0 0 1 0,-30 Z" fill="#38BDF8" />
              {/* Center hole */}
              <circle r="14" fill="#FFFFFF" />
              <circle r="4" fill="#4F46E5" />
            </g>
          </g>
        </motion.g>

        {/* ---------- Potted Plant (Right Desk) ---------- */}
        <motion.g
          className="potted-plant"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "590px 445px" }}
          filter="url(#sketchShadow)"
        >
          {/* Pot */}
          <polygon points="565,445 615,445 608,495 572,495" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="560" y="440" width="60" height="8" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.8" />
          {/* Soil */}
          <ellipse cx="590" cy="442" rx="26" ry="4" fill="#78350F" />

          {/* Plant Stems & Leaves */}
          <path d="M 590,440 C 570,390 565,340 580,310" fill="none" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
          <path d="M 590,440 C 605,385 615,350 600,315" fill="none" stroke="#166534" strokeWidth="5" strokeLinecap="round" />
          <path d="M 590,440 C 585,410 592,370 590,340" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />

          {/* Leaves */}
          <path d="M 580,310 C 560,310 545,325 555,345 C 575,340 580,325 580,310 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
          <path d="M 600,315 C 620,310 635,325 625,345 C 605,340 600,325 600,315 Z" fill="#4ADE80" stroke="#166534" strokeWidth="1.2" />
          <path d="M 585,350 C 560,360 550,380 570,390 C 585,380 588,365 585,350 Z" fill="#15803D" stroke="#14532D" strokeWidth="1.2" />
          <path d="M 595,355 C 620,360 630,380 610,390 C 595,380 592,365 595,355 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
        </motion.g>

        {/* ---------- Floating Star & Sparkle Dust ---------- */}
        {[
          { cx: 80, cy: 100, r: 3, delay: 0 },
          { cx: 340, cy: 170, r: 2.5, delay: 0.8 },
          { cx: 580, cy: 160, r: 3.5, delay: 1.6 },
          { cx: 480, cy: 190, r: 2.2, delay: 2.2 },
          { cx: 160, cy: 260, r: 2.8, delay: 1.2 },
        ].map((item, idx) => (
          <motion.circle
            key={idx}
            cx={item.cx}
            cy={item.cy}
            r={item.r}
            fill="#EAB308"
            animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -12, 0] }}
            transition={{ duration: 4, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  )
}
