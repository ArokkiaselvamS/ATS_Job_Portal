import React from 'react';
import './FlightBackground.css';

export default function FlightBackground({ opacity = 0.18 }) {
  return (
    <div
      className="flight-bg-wrapper"
      style={{ '--flight-bg-opacity': opacity }}
      aria-hidden="true"
    >
      {/* Dynamic Animated Flight Scene */}
      <div className="flight-bg-scene">
        {/* Ambient Cosmic Stars & Particles */}
        <div className="flight-stars-layer"></div>

        {/* Holographic Earth Globe */}
        <div className="flight-globe-container">
          <div className="flight-globe-sphere">
            {/* Globe Grid & Continents Pattern */}
            <div className="globe-grid"></div>
            <div className="globe-atmosphere"></div>
            <div className="globe-light-points">
              <span className="light-dot dot-1"></span>
              <span className="light-dot dot-2"></span>
              <span className="light-dot dot-3"></span>
              <span className="light-dot dot-4"></span>
              <span className="light-dot dot-5"></span>
            </div>
          </div>

          {/* Orbit Rings and Glowing Route Arcs */}
          <svg className="flight-orbit-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="orbitCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="orbitOrangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#ffb347" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glowBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Orbit paths around the globe */}
            <ellipse
              cx="500"
              cy="300"
              rx="360"
              ry="140"
              className="orbit-path orbit-path-cyan"
              transform="rotate(-18 500 300)"
            />
            <ellipse
              cx="500"
              cy="300"
              rx="410"
              ry="110"
              className="orbit-path orbit-path-orange"
              transform="rotate(24 500 300)"
            />
            <ellipse
              cx="500"
              cy="300"
              rx="450"
              ry="180"
              className="orbit-path orbit-path-subtle"
              transform="rotate(-40 500 300)"
            />

            {/* Moving Light Beam on Orange Orbit */}
            <path
              d="M 120,360 Q 420,180 840,240"
              className="flight-trail-beam beam-orange"
            />
            {/* Moving Light Beam on Cyan Orbit */}
            <path
              d="M 880,380 Q 520,440 160,200"
              className="flight-trail-beam beam-cyan"
            />
          </svg>

          {/* Main Animated Flying Airplane with Jet Contrail */}
          <div className="airplane-flight-track">
            <div className="airplane-motion-box">
              {/* Glowing Jet Engine Contrail */}
              <div className="airplane-contrail-orange"></div>
              <div className="airplane-contrail-cyan"></div>
              <div className="airplane-engine-flare"></div>

              {/* 3D-styled Sleek Commercial Jet SVG */}
              <svg
                className="airplane-svg"
                viewBox="0 0 160 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Airplane Wing Shadow */}
                <path
                  d="M48 52 L95 86 L104 84 L72 50 Z"
                  fill="#0284c7"
                  opacity="0.7"
                />
                {/* Airplane Main Fuselage */}
                <path
                  d="M148 42 C148 42 120 34 76 38 C42 41 18 47 12 50 C8 52 14 55 24 55 C60 55 106 49 140 46 C146 45 150 43 148 42 Z"
                  fill="url(#fuselageGrad)"
                />
                {/* Cockpit Windshield */}
                <path
                  d="M136 41 C138 41 142 42 143 43 C140 43.8 136 44 133 43.5 Z"
                  fill="#38bdf8"
                />
                {/* Main Top Wing */}
                <path
                  d="M80 40 L115 12 L124 13 L88 41 Z"
                  fill="url(#wingGrad)"
                />
                {/* Wing Tip Neon Glow Line */}
                <path d="M115 12 L124 13" stroke="#ff7a00" strokeWidth="2.5" strokeLinecap="round" />
                {/* Tail Wing */}
                <path
                  d="M20 48 L8 24 L16 23 L32 47 Z"
                  fill="#0369a1"
                />
                <path d="M8 24 L16 23" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                {/* Horizontal Stabilizer */}
                <path
                  d="M18 51 L10 60 L14 62 L28 53 Z"
                  fill="#0284c7"
                />
                {/* Jet Engine Pod */}
                <ellipse cx="82" cy="54" rx="12" ry="5" fill="#1e293b" />
                <ellipse cx="89" cy="54" rx="4" ry="4" fill="#f97316" />

                <defs>
                  <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="35%" stopColor="#0284c7" />
                    <stop offset="70%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                  </linearGradient>
                  <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0369a1" />
                    <stop offset="60%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Secondary Distant High-Speed Flight Silhouette */}
          <div className="airplane-flight-track-secondary">
            <div className="airplane-motion-box-small">
              <div className="small-flight-contrail"></div>
              <svg className="small-airplane-svg" viewBox="0 0 60 40" fill="none">
                <path
                  d="M55 18 C50 15 28 16 6 20 C18 22 42 21 55 18 Z"
                  fill="#38bdf8"
                />
                <path d="M32 17 L44 5 L47 6 L36 18 Z" fill="#7dd3fc" />
                <path d="M12 20 L5 9 L8 9 L15 20 Z" fill="#0284c7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
