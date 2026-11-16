import React from 'react';
import { Attraction } from '../types';
import { AttractionCard } from './AttractionCard';
import { Filter, SlidersHorizontal, MapPin, SearchX, RotateCcw } from 'lucide-react';

interface AttractionListProps {
  attractions: Attraction[];
  allCategories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  maxDistance: number;
  onMaxDistanceChange: (dist: number) => void;
  sortBy: 'distance' | 'name' | 'category';
  onSortChange: (sort: 'distance' | 'name' | 'category') => void;
  selectedAttraction: Attraction | null;
  onSelectAttraction: (attraction: Attraction) => void;
  itineraryAttractionIds: string[];
  onToggleItinerary: (attraction: Attraction) => void;
  onResetFilters: () => void;
}

export const AttractionList: React.FC<AttractionListProps> = ({
  attractions,
  allCategories,
  selectedCategory,
  onSelectCategory,
  maxDistance,
  onMaxDistanceChange,
  sortBy,
  onSortChange,
  selectedAttraction,
  onSelectAttraction,
  itineraryAttractionIds,
  onToggleItinerary,
  onResetFilters,
}) => {
  return (
    <div className="space-y-6">
      {/* Filters & Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        {/* Top bar with count & active filter info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              Available Destinations ({attractions.length})
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Within 25 km Radius
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="distance">Nearest to Minuwangoda First</option>
              <option value="name">Alphabetical (A - Z)</option>
              <option value="category">Destination Category</option>
            </select>

            {(selectedCategory !== 'All' || maxDistance < 25) && (
              <button
                onClick={onResetFilters}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 ml-2 underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips (REQ-002, REQ-003, REQ-004) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Filter by Tourism Category
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Range Slider */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-80">
            <label className="font-bold text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Max Distance:</span>
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={maxDistance}
              onChange={(e) => onMaxDistanceChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="font-bold text-slate-900 w-14 shrink-0 text-right">
              &le; {maxDistance} km
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Minuwangoda town center coordinates: 7.1652° N, 79.9547° E
          </div>
        </div>
      </div>

      {/* Attractions Grid or REQ-006 Empty State */}
      {attractions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-md">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No Tourist Places Found (REQ-006)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            There are currently no attractions matching your selected category "{selectedCategory}" or distance radius of {maxDistance} km.
          </p>
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((place) => (
            <AttractionCard
              key={place.id}
              attraction={place}
              isSelected={selectedAttraction?.id === place.id}
              isInItinerary={itineraryAttractionIds.includes(place.id)}
              onSelect={onSelectAttraction}
              onToggleItinerary={onToggleItinerary}
            />
          ))}
        </div>
      )}
    </div>
  );
};
