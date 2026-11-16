import React from 'react';
import { TriporaLogo } from './TriporaLogo';
import { MapPin, Compass, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'browse' | 'map' | 'itinerary' | 'guide') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-2">
            <TriporaLogo size="md" lightMode={true} showTagline={true} />
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Local Tourist Day-Visit Planner and Information System engineered to centralize verified travel information within a 25 km radius of Minuwangoda, Sri Lanka.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Gampaha District Gateway • Western Province, Sri Lanka</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">
              Quick Navigation
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('browse')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Browse 25km Attractions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('map')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Interactive Radius Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('itinerary')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  1-Day Itinerary Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('guide')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Minuwangoda Travel Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: System & Administration */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">
              Platform & System
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Admin Management Portal</span>
                </button>
              </li>
              <li className="text-slate-500">Express.js + MongoDB Store</li>
              <li className="text-slate-500">IEEE 830-1998 SRS Standard</li>
              <li className="text-slate-500">Zero Commission Direct Discovery</li>
            </ul>
          </div>
        </div>

        {/* Academic Citation & Project Attribution */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
          <div>
            <span className="text-slate-300 font-semibold">
              ITE2953 Programming Group Project
            </span>{' '}
            • Prepared by <span className="text-slate-300 font-medium">M.P.D.L. Gunarathna (Reg: E2410510)</span> • University of Moratuwa
          </div>
          <div className="text-slate-500 flex items-center gap-1 justify-center">
            <span>Designed for Sri Lanka Tourism Discovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
