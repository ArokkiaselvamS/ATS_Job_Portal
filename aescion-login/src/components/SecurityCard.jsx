import './SecurityCard.css'

export default function SecurityCard() {
  return (
    <div className="security-card">
      <div className="security-card__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      <div className="security-card__text">
        <p className="security-card__title">Secure &amp; Trusted Platform</p>
        <p className="security-card__desc">Your data is protected with enterprise-grade security.</p>
      </div>

      <div className="security-card__badge" aria-hidden="true">
        <svg width="34" height="38" viewBox="0 0 38 42" fill="none">
          <defs>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#312e81" />
            </linearGradient>
            <linearGradient id="shieldOrange" x1="19" y1="8" x2="19" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f97316" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path d="M19 2L5 7.5V18.5C5 27.5 11 35.8 19 40C27 35.8 33 27.5 33 18.5V7.5L19 2Z" fill="url(#shieldGrad)" />
          <path d="M19 4L7 8.8V18.5C7 26.5 12.2 33.9 19 37.8C25.8 33.9 31 26.5 31 18.5V8.8L19 4Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M19 8L10 12.5V19.5C10 25.5 13.8 31 19 34C24.2 31 28 25.5 28 19.5V12.5L19 8Z" fill="url(#shieldOrange)" />
          <path d="M15 20.5L18 23.5L23.5 17.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

