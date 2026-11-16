import React, { useState, useEffect } from 'react';
import { Attraction } from '../types';
import {
  X,
  MapPin,
  Clock,
  Compass,
  ExternalLink,
  Plus,
  Check,
  Calendar,
  AlertCircle,
  HelpCircle,
  Tag,
  ImageIcon,
} from 'lucide-react';

interface AttractionDetailModalProps {
  attraction: Attraction | null;
  isOpen: boolean;
  onClose: () => void;
  isInItinerary: boolean;
  onToggleItinerary: (attraction: Attraction) => void;
}

export const AttractionDetailModal: React.FC<AttractionDetailModalProps> = ({
  attraction,
  isOpen,
  onClose,
  isInItinerary,
  onToggleItinerary,
}) => {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (attraction) {
      setActiveImage(attraction.image_url);
    }
  }, [attraction]);

  if (!isOpen || !attraction) return null;

  const driveTimeMins = Math.max(10, Math.round(attraction.distance_km * 2.2));
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${attraction.location_coords.lat},${attraction.location_coords.lng}`;
  const gallery = attraction.gallery && attraction.gallery.length > 0 ? attraction.gallery : [attraction.image_url];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header Image */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 bg-slate-900">
          <img
            src={activeImage || attraction.image_url}
            alt={attraction.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Radius indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-600/90 text-white shadow-sm backdrop-blur-sm">
              {attraction.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {attraction.distance_km} km from Minuwangoda
            </span>
          </div>

          {/* Place Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
              {attraction.name}
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1 flex items-center gap-3">
              <span>📍 Coordinates: {attraction.location_coords.lat.toFixed(4)}° N, {attraction.location_coords.lng.toFixed(4)}° E</span>
              <span>•</span>
              <span>🚗 ~{driveTimeMins} mins travel time</span>
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Authentic Local Photos Gallery */}
          {gallery.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Destination Photo Gallery ({gallery.length} Photos)</span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      (activeImage || attraction.image_url) === imgUrl
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operating Hours</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{attraction.opening_hours}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Best Visit Window</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{attraction.best_time || 'Morning hours'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Entry Information</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{attraction.entry_fee || 'Free / Public'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>Recommended Stay</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{attraction.estimated_duration_mins} Minutes</span>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              About This Destination
            </h4>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {attraction.description}
            </p>
          </div>

          {/* Cultural Guidelines & Practical Guidance (Stakeholder Requirement: Hakeel MNM & Weerasekara) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Visitor & Cultural Travel Guidelines</span>
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0">• Dress Code:</span>
                <span>{attraction.dress_code || 'Standard modest travel attire.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0">• Practical Advice:</span>
                <span>{attraction.travel_tips}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0">• Facilities on site:</span>
                <span>
                  {attraction.parking_available ? 'Dedicated car/van parking available' : 'Limited roadside parking'},{' '}
                  {attraction.family_friendly ? 'welcomes families with kids' : 'standard visit'}.
                </span>
              </div>
            </div>
          </div>

          {/* Scope notice reminder (from SRS) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Tripora is an independent local informational catalog and day planner. In accordance with project boundaries, no bookings, ticket payments, or third-party commissions are processed.
            </span>
          </div>
        </div>

        {/* Modal Sticky Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>External Map & Directions</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleItinerary(attraction)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md ${
                isInItinerary
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isInItinerary ? (
                <>
                  <Check className="w-4 h-4 text-rose-600" />
                  <span>Remove from 1-Day Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add to 1-Day Plan</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
