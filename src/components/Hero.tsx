import React from 'react';
import { Search, MapPin, Sparkles, Plane, Compass, ShieldCheck } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onExploreClick: () => void;
  totalAttractions: number;
}

const POPULAR_CATEGORIES = [
  'All',
  'Heritage / Religious',
  'Nature / Parks',
  'Nature / Wildlife',
  'Coastal / Sightseeing',
  'Sightseeing / Theme Park',
  'Nature / Agro-Tourism',
];

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onExploreClick,
  totalAttractions,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle background tourism pattern elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Strategic Gateway Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-500/30 shadow-sm backdrop-blur-md">
          <Plane className="w-3.5 h-3.5 text-amber-400 rotate-45" />
          <span>Strategic Gateway • 15 Mins from CMB International Airport</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Minuwangoda 25 km Radius Hub</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
          Plan Your Authentic <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
            One-Day Tour Around Minuwangoda
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
          Break free from fragmented tourist guides and inflated middleman fares. Discover ancient cave monasteries, rubber heritage gardens, wildlife sanctuaries, and golden Negombo sunsets strictly within 25 km.
        </p>

        {/* Live Search Bar (REQ-03 Text Search by destination name) */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-1.5 border border-white/20 text-slate-800">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search attractions (e.g. Asgiriya, Botanical Garden, Beach, Temple, Farm)..."
              className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Places</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar (REQ-002 Filter by predefined categories) */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {POPULAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md scale-105'
                  : 'bg-emerald-950/40 text-emerald-200 border-emerald-700/40 hover:bg-emerald-800/60'
              }`}
            >
              {cat === 'All' ? `All Places (${totalAttractions})` : cat}
            </button>
          ))}
        </div>

        {/* Guarantees & Transparency Badges */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-emerald-200/80 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict 25 km Geographic Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Zero Middleman Fees • Independent Catalog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Exact GPS Coordinates & Travel Times</span>
          </div>
        </div>
      </div>
    </div>
  );
};
