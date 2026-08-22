import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
  clickable?: boolean;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 44,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.866)}
      viewBox="0 0 100 86.6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="AESCION Logo Icon"
    >
      {/* 1. Top-Left Blue Triangle (Shield & Security) */}
      <polygon points="0,0 50,0 25,43.3" fill="#2B26D9" />

      {/* 2. Top-Right Orange Triangle (AI & Technology) */}
      <polygon points="50,0 100,0 75,43.3" fill="#F96302" />

      {/* 3. Center White Triangle (Education & Growth) */}
      <polygon points="50,0 25,43.3 75,43.3" fill="#FFFFFF" />

      {/* 4. Bottom Charcoal Triangle (Network & Connectivity) */}
      <polygon points="25,43.3 75,43.3 50,86.6" fill="#363636" />

      {/* --- ICON DETAILS --- */}

      {/* Top-Left Icon: Shield with keyhole & circuit lines (White) */}
      <g stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Shield contour */}
        <path d="M25 6 C20 6 18.5 7.5 18.5 7.5 V15 C18.5 19 21.5 22 25 23.5 C28.5 22 31.5 19 31.5 15 V7.5 C31.5 7.5 30 6 25 6 Z" />
        {/* Keyhole */}
        <circle cx="25" cy="12.5" r="1.8" fill="#FFFFFF" />
        <path d="M24.2 13.5 H25.8 L26.2 17.5 H23.8 Z" fill="#FFFFFF" stroke="none" />
        {/* Circuit nodes around shield */}
        <circle cx="15.5" cy="11" r="0.8" fill="#FFFFFF" stroke="none" />
        <path d="M15.5 11 H18" />
        <circle cx="14" cy="17" r="0.8" fill="#FFFFFF" stroke="none" />
        <path d="M14 17 H18.5" />
        <circle cx="34.5" cy="11" r="0.8" fill="#FFFFFF" stroke="none" />
        <path d="M34.5 11 H32" />
        <circle cx="36" cy="17" r="0.8" fill="#FFFFFF" stroke="none" />
        <path d="M36 17 H31.5" />
      </g>

      {/* Top-Right Icon: AI Chip (White) */}
      <g fill="none">
        {/* Chip Body */}
        <rect x="69" y="8.5" width="12" height="12" rx="2" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Chip Pins - Left & Right */}
        <path
          d="M66 11H69 M66 14.5H69 M66 18H69 M81 11H84 M81 14.5H84 M81 18H84"
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Chip Pins - Top & Bottom */}
        <path
          d="M72 5.5V8.5 M75 5.5V8.5 M78 5.5V8.5 M72 20.5V23.5 M75 20.5V23.5 M78 20.5V23.5"
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Pin end dots */}
        <circle cx="65.2" cy="11" r="0.7" fill="#FFFFFF" />
        <circle cx="65.2" cy="14.5" r="0.7" fill="#FFFFFF" />
        <circle cx="65.2" cy="18" r="0.7" fill="#FFFFFF" />
        <circle cx="84.8" cy="11" r="0.7" fill="#FFFFFF" />
        <circle cx="84.8" cy="14.5" r="0.7" fill="#FFFFFF" />
        <circle cx="84.8" cy="18" r="0.7" fill="#FFFFFF" />
        {/* AI Text inside Chip */}
        <text
          x="75"
          y="17"
          fill="#FFFFFF"
          fontSize="7"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          letterSpacing="-0.3px"
        >
          AI
        </text>
      </g>

      {/* Center Icon: Mortarboard / Graduation Cap (Vibrant Blue) */}
      <g fill="#2B26D9" stroke="#2B26D9" strokeLinejoin="round">
        {/* Cap top diamond */}
        <path d="M50 16.5 L64.5 22.5 L50 28.5 L35.5 22.5 Z" strokeWidth="1" />
        {/* Cap base skullcap */}
        <path
          d="M41 24.8 V29.5 C41 32 59 32 59 29.5 V24.8"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Cap tassel */}
        <path d="M62 23.5 V31.5" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="62" cy="32.5" r="1.1" stroke="none" />
      </g>

      {/* Bottom Icon: Monitor with Wi-Fi Signal (White) */}
      <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
        {/* Monitor Screen Frame */}
        <rect x="39.5" y="49" width="21" height="14" rx="2" strokeWidth="1.5" />
        {/* Monitor Stand Base */}
        <path d="M46.5 63 L45 68.5 H55 L53.5 63" strokeWidth="1.4" />
        <path d="M43 68.5 H57" strokeWidth="1.5" />
        {/* Wi-Fi Signals on screen */}
        <circle cx="50" cy="59.5" r="0.9" fill="#FFFFFF" stroke="none" />
        <path d="M47.2 57 C48.8 55.6 51.2 55.6 52.8 57" strokeWidth="1.3" />
        <path d="M44.8 54.2 C47.7 51.8 52.3 51.8 55.2 54.2" strokeWidth="1.3" />
      </g>
    </svg>
  );
};

export default function Logo({
  className = "",
  iconSize = 46,
  textSize = "text-2xl sm:text-3xl",
  showText = true,
  clickable = true,
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      <LogoIcon size={iconSize} />
      {showText && (
        <span
          className={`font-black tracking-tight select-none leading-none ${textSize}`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span style={{ color: "#F96302" }}>AE</span>
          <span style={{ color: "#2B26D9" }}>SCI</span>
          <span style={{ color: "#363636" }}>ON</span>
        </span>
      )}
    </div>
  );

  if (!clickable) return content;

  return (
    <Link
      to="/"
      aria-label="AESCION Home"
      className="inline-flex items-center transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
    >
      {content}
    </Link>
  );
}
