import React, { useState } from 'react';
import { TriporaLogo } from './TriporaLogo';
import {
  Compass,
  MapPin,
  Calendar,
  BookOpen,
  Lock,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'browse' | 'map' | 'itinerary' | 'guide';
  setActiveTab: (tab: 'browse' | 'map' | 'itinerary' | 'guide') => void;
  itineraryCount: number;
  onOpenAdmin: () => void;
}

interface NavLinkItem {
  id: 'browse' | 'map' | 'itinerary' | 'guide';
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  itineraryCount,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: NavLinkItem[] = [
    { id: 'browse', label: 'Discover Places', icon: Compass },
    { id: 'map', label: '25 km Map', icon: MapPin },
    { id: 'itinerary', label: '1-Day Planner', icon: Calendar, badge: itineraryCount },
    { id: 'guide', label: 'Minuwangoda Guide', icon: BookOpen },
  ];

  const handleTabClick = (tab: 'browse' | 'map' | 'itinerary' | 'guide') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('browse')}
            className="cursor-pointer"
          >
            <TriporaLogo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Admin Portal trigger */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Open System Administrator Portal"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            {itineraryCount > 0 && (
              <button
                onClick={() => handleTabClick('itinerary')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"
              >
                <span>Plan</span>
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                  {itineraryCount}
                </span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-2.5"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
