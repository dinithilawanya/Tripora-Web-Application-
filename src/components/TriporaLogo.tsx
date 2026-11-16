import React from 'react';

interface TriporaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightMode?: boolean;
}

export const TriporaLogo: React.FC<TriporaLogoProps> = ({
  size = 'md',
  showTagline = true,
  lightMode = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Tourism Emblem: Compass Rose + Island Palm + Rising Sun */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 rounded-xl shadow-md rotate-3 transition-transform group-hover:rotate-6"></div>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full p-1.5 text-white"
        >
          {/* Compass outer ring */}
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="3 3" />
          
          {/* Rising tropical sun glow */}
          <path
            d="M17 28C17 24.134 20.134 21 24 21C27.866 21 31 24.134 31 28"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Tropical Palm fronds */}
          <path
            d="M24 35C24 28 20 22 14 20"
            stroke="#A7F3D0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M24 35C25 27 29 22 35 21"
            stroke="#6EE7B7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Golden Navigation Compass North Arrow */}
          <polygon
            points="24,8 27.5,21 24,18 20.5,21"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1"
          />
          {/* Compass South Pointer */}
          <polygon
            points="24,38 26.5,27 24,29 21.5,27"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
          
          {/* Center compass pivot jewel */}
          <circle cx="24" cy="24" r="3" fill="#047857" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight ${textSizes[size]} ${lightMode ? 'text-white' : 'text-slate-900'}`}>
            Tripora
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300/60">
            25km
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-normal ${lightMode ? 'text-emerald-100' : 'text-slate-500'}`}>
            Local Day-Visit Planner • Minuwangoda
          </span>
        )}
      </div>
    </div>
  );
};
