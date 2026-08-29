import React from "react";
import "./BrandBackground.css";

interface Point {
  name: string;
  x: number;
  y: number;
  color: string;
}

interface RandomRoute {
  id: string;
  from: string;
  to: string;
  d: string;
  color: string;
  dur: string;
  delay: string;
  scale?: number;
}

// Hub Points distributed organically across the canvas
const hubPoints: Point[] = [
  { name: "SFO", x: 130, y: 140, color: "#2B26D9" },
  { name: "NYC", x: 420, y: 210, color: "#F96302" },
  { name: "LON", x: 700, y: 110, color: "#2B26D9" },
  { name: "HKG", x: 1060, y: 230, color: "#F96302" },
  { name: "TYO", x: 1320, y: 140, color: "#2B26D9" },

  { name: "MEX", x: 190, y: 410, color: "#F96302" },
  { name: "DXB", x: 720, y: 390, color: "#2B26D9" },
  { name: "BLR", x: 930, y: 350, color: "#F96302" },
  { name: "SIN", x: 1220, y: 440, color: "#2B26D9" },

  { name: "BOG", x: 360, y: 550, color: "#2B26D9" },
  { name: "SYD", x: 1140, y: 610, color: "#F96302" },
  { name: "SAO", x: 230, y: 730, color: "#F96302" },
  { name: "CPT", x: 740, y: 770, color: "#2B26D9" },
  { name: "AKL", x: 1330, y: 790, color: "#F96302" },
];

// Criss-Crossing, Random Diagonal & Non-Linear Routes between random points
const randomRoutesWithTravel: RandomRoute[] = [
  // 1. SFO (130,140) -> SYD (1140,610) [Top-Left to Lower-Right long diagonal]
  { id: "r1", from: "SFO", to: "SYD", d: "M 130 140 C 350 320, 750 560, 1140 610", color: "#2B26D9", dur: "38s", delay: "0s", scale: 1.24 },
  
  // 2. SAO (230,730) -> TYO (1320,140) [Bottom-Left to Top-Right ascending cross-cut]
  { id: "r2", from: "SAO", to: "TYO", d: "M 230 730 C 580 620, 940 380, 1320 140", color: "#F96302", dur: "42s", delay: "3s", scale: 1.25 },
  
  // 3. NYC (420,210) -> CPT (740,770) [Upper-Left diving to Bottom-Center]
  { id: "r3", from: "NYC", to: "CPT", d: "M 420 210 C 480 440, 620 640, 740 770", color: "#2B26D9", dur: "36s", delay: "7s", scale: 1.2 },
  
  // 4. SIN (1220,440) -> SFO (130,140) [Center-Right climbing up-left to Top-Left]
  { id: "r4", from: "SIN", to: "SFO", d: "M 1220 440 C 920 280, 520 80, 130 140", color: "#F96302", dur: "40s", delay: "2s", scale: 1.22 },
  
  // 5. AKL (1330,790) -> LON (700,110) [Bottom-Right climbing steeply to Top-Center]
  { id: "r5", from: "AKL", to: "LON", d: "M 1330 790 C 1180 500, 960 220, 700 110", color: "#2B26D9", dur: "44s", delay: "9s", scale: 1.2 },
  
  // 6. MEX (190,410) -> HKG (1060,230) [Center-Left climbing across to Upper-Right]
  { id: "r6", from: "MEX", to: "HKG", d: "M 190 410 C 440 240, 780 180, 1060 230", color: "#F96302", dur: "37s", delay: "5s", scale: 1.22 },
  
  // 7. BLR (930,350) -> SAO (230,730) [Mid-Center diving down-left to Bottom-Left]
  { id: "r7", from: "BLR", to: "SAO", d: "M 930 350 C 720 540, 480 680, 230 730", color: "#2B26D9", dur: "39s", delay: "11s", scale: 1.24 },
  
  // 8. CPT (740,770) -> TYO (1320,140) [Bottom-Center climbing up-right to Top-Right]
  { id: "r8", from: "CPT", to: "TYO", d: "M 740 770 C 920 620, 1180 380, 1320 140", color: "#F96302", dur: "41s", delay: "1s", scale: 1.2 },
  
  // 9. BOG (360,550) -> SIN (1220,440) [Lower-Left sweeping up-right to Center-Right]
  { id: "r9", from: "BOG", to: "SIN", d: "M 360 550 C 640 460, 940 480, 1220 440", color: "#2B26D9", dur: "35s", delay: "6s", scale: 1.18 },
  
  // 10. LON (700,110) -> MEX (190,410) [Top-Center diving down-left to Center-Left]
  { id: "r10", from: "LON", to: "MEX", d: "M 700 110 C 510 180, 320 280, 190 410", color: "#F96302", dur: "33s", delay: "8s", scale: 1.22 },
  
  // 11. HKG (1060,230) -> AKL (1330,790) [Upper-Right diving down-right to Bottom-Right]
  { id: "r11", from: "HKG", to: "AKL", d: "M 1060 230 C 1140 420, 1260 620, 1330 790", color: "#2B26D9", dur: "37s", delay: "4s", scale: 1.2 },
  
  // 12. DXB (720,390) -> NYC (420,210) [Center arcing up-left to Upper-Left]
  { id: "r12", from: "DXB", to: "NYC", d: "M 720 390 C 620 280, 520 230, 420 210", color: "#F96302", dur: "30s", delay: "10s", scale: 1.25 },
];

export default function BrandBackground() {
  return (
    <div className="brand-bg-container" aria-hidden="true">
      {/* Soft Ambient Gradients across the canvas in Logo Colors */}
      <div className="brand-orb brand-orb-blue"></div>
      <div className="brand-orb brand-orb-orange"></div>
      <div className="brand-orb brand-orb-bottom-blue"></div>
      <div className="brand-orb brand-orb-bottom-orange"></div>

      {/* SVG Canvas with Criss-Crossing Random Routes & Flights */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="brand-bg-svg"
      >
        <defs>
          <linearGradient id="planeBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2B26D9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#514BFF" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="planeOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F96302" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF964A" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. Criss-Crossing Random Route Curves with Soft Opacity */}
        {randomRoutesWithTravel.map((route) => (
          <path
            key={`route-${route.id}`}
            d={route.d}
            fill="none"
            stroke={route.color}
            strokeWidth="1.1"
            strokeDasharray="4 6"
            className="random-route-path"
            opacity="0.18"
          />
        ))}

        {/* 2. Global Hub City Points */}
        {hubPoints.map((pt) => (
          <g key={`point-${pt.name}`} className="hub-node-group">
            {/* Radar Pulse Ring */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="7"
              fill="none"
              stroke={pt.color}
              strokeWidth="0.8"
              opacity="0.18"
              className="hub-pulse-circle"
            />
            {/* Center Point Dot */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="2.8"
              fill={pt.color}
              opacity="0.7"
            />
            {/* Hub Point Name */}
            <text
              x={pt.x + 7}
              y={pt.y - 4}
              fill={pt.color}
              fontSize="9"
              fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
              fontWeight="700"
              opacity="0.32"
              letterSpacing="0.5px"
            >
              {pt.name}
            </text>
          </g>
        ))}

        {/* 3. Larger Aeroplanes with Softened Contrails and Refined Opacity */}
        {randomRoutesWithTravel.map((route) => (
          <g key={`flight-${route.id}`}>
            <g>
              <animateMotion
                path={route.d}
                dur={route.dur}
                begin={route.delay}
                repeatCount="indefinite"
                rotate="auto"
              />

              {/* Glowing Jet Engine Contrail Stream */}
              <line
                x1="-28"
                y1="0"
                x2="-4"
                y2="0"
                stroke={route.color}
                strokeWidth="2.0"
                strokeLinecap="round"
                opacity="0.45"
              />

              {/* Commercial Aircraft Silhouette */}
              <g transform={`scale(${route.scale || 1.22}) translate(-5, 0)`}>
                <path
                  d="M 14 0 
                     C 13 -1 9.5 -2 4 -2.2 
                     L 0 -11.5 
                     C -0.6 -12.5 -1.3 -12.5 -1.7 -12 
                     L -2.3 -11.5 
                     L -0.5 -2 
                     L -6 -2 
                     L -8 -6 
                     C -8.5 -6.5 -9.2 -6.5 -9.6 -6 
                     L -10 -5.5 
                     L -8.5 -1.3 
                     L -11.5 -1.3 
                     C -12.2 -1.3 -12.6 -0.6 -12 0 
                     C -12.6 0.6 -12.2 1.3 -11.5 1.3 
                     L -8.5 1.3 
                     L -10 5.5 
                     C -9.2 6.5 -8.5 6.5 -8 6 
                     L -6 2 
                     L -0.5 2 
                     L -2.3 11.5 
                     C -1.3 12.5 -0.6 12.5 0 12 
                     L 4 2.2 
                     C 9.5 2 13 1 14 0 Z"
                  fill={route.color === "#2B26D9" ? "url(#planeBlueGrad)" : "url(#planeOrangeGrad)"}
                  stroke="#FFFFFF"
                  strokeWidth="0.85"
                  opacity="0.82"
                />
                {/* Cockpit Window Light */}
                <circle cx="7" cy="0" r="1.3" fill="#FFFFFF" opacity="0.9" />
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
