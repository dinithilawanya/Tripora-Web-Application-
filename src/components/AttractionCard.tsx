import React from 'react';
import { Attraction } from '../types';
import { MapPin, Clock, Info, Check, Plus, ShieldCheck, Car, Users } from 'lucide-react';

interface AttractionCardProps {
  attraction: Attraction;
  isSelected: boolean;
  isInItinerary: boolean;
  onSelect: (attraction: Attraction) => void;
  onToggleItinerary: (attraction: Attraction) => void;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({
  attraction,
  isSelected,
  isInItinerary,
  onSelect,
  onToggleItinerary,
}) => {
  const getCategoryStyles = (category: string) => {
    if (category.includes('Religious') || category.includes('Heritage')) {
      return 'bg-amber-100 text-amber-900 border-amber-200';
    }
    if (category.includes('Nature') || category.includes('Parks') || category.includes('Wildlife')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
    if (category.includes('Coastal')) {
      return 'bg-sky-100 text-sky-900 border-sky-200';
    }
    if (category.includes('Agro')) {
      return 'bg-lime-100 text-lime-900 border-lime-200';
    }
    if (category.includes('Theme')) {
      return 'bg-purple-100 text-purple-900 border-purple-200';
    }
    return 'bg-indigo-100 text-indigo-900 border-indigo-200';
  };

  // Estimate drive time assuming ~30-40km/h average local speed
  const driveTimeMins = Math.max(10, Math.round(attraction.distance_km * 2.2));

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xl -translate-y-1'
          : 'border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Image & Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(attraction)}>
        <img
          src={attraction.image_url}
          alt={attraction.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1 border border-slate-200/60">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{attraction.distance_km} km</span>
          <span className="text-slate-400 font-normal">({driveTimeMins} min drive)</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${getCategoryStyles(attraction.category)}`}>
            {attraction.category}
          </span>
        </div>

        {/* Name on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white drop-shadow-sm leading-snug line-clamp-1">
            {attraction.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-emerald-200/90 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              {attraction.opening_hours}
            </span>
          </div>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {attraction.description}
        </p>

        {/* Travel Tips pill */}
        <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/60 text-xs text-amber-900 mb-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2 italic font-medium">
            Tip: {attraction.travel_tips}
          </span>
        </div>

        {/* Badges footer */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 flex-wrap">
          {attraction.dress_code && (
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {attraction.dress_code.includes('White') ? 'Temple Etiquette' : 'Modest Dress'}
            </span>
          )}
          {attraction.family_friendly && (
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-600" />
              Family Friendly
            </span>
          )}
          {attraction.parking_available && (
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-600" />
              Parking
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onSelect(attraction)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Full Profile</span>
          </button>

          <button
            onClick={() => onToggleItinerary(attraction)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              isInItinerary
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isInItinerary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>In Itinerary</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Day Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
