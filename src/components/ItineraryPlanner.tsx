import React, { useState } from 'react';
import { Attraction, ItineraryItem, SavedItinerary } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  ArrowUp,
  ArrowDown,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  Route,
  Compass,
  FileText,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ItineraryPlannerProps {
  itineraryItems: Attraction[];
  onRemoveItem: (id: string) => void;
  onReorder: (items: Attraction[]) => void;
  onClearItinerary: () => void;
  onViewOnMap: () => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  itineraryItems,
  onRemoveItem,
  onReorder,
  onClearItinerary,
  onViewOnMap,
}) => {
  const [travelerName, setTravelerName] = useState('Valued Traveler');
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tripNotes, setTripNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedResult, setSavedResult] = useState<SavedItinerary | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Suggested time slot assignments based on order
  const getTimeSlot = (index: number) => {
    if (index === 0) return 'Morning (08:30 AM - 11:30 AM)';
    if (index === 1) return 'Midday / Lunch (11:30 AM - 02:30 PM)';
    if (index === 2) return 'Afternoon (02:30 PM - 05:00 PM)';
    return 'Sunset / Evening (05:00 PM - 07:30 PM)';
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...itineraryItems];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onReorder(next);
  };

  const moveDown = (index: number) => {
    if (index >= itineraryItems.length - 1) return;
    const next = [...itineraryItems];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onReorder(next);
  };

  // Calculations
  const totalAttractions = itineraryItems.length;
  const totalDirectDistance = itineraryItems.reduce((acc, curr) => acc + curr.distance_km, 0);
  const totalStayMinutes = itineraryItems.reduce((acc, curr) => acc + curr.estimated_duration_mins, 0);
  // Estimate travel time between stops (~20 mins average per transfer)
  const totalTravelMinutes = Math.round(totalDirectDistance * 1.8);
  const totalDayMinutes = totalStayMinutes + totalTravelMinutes;
  const totalDayHours = (totalDayMinutes / 60).toFixed(1);

  // Pace assessment
  const getPaceAssessment = () => {
    if (totalAttractions === 0) return { label: 'Empty Plan', color: 'text-slate-400', desc: 'Select places to start' };
    if (totalAttractions <= 2) return { label: 'Relaxed & Leisurely', color: 'text-emerald-600', desc: 'Plenty of time to immerse in each destination' };
    if (totalAttractions <= 4) return { label: 'Optimal 1-Day Pace', color: 'text-teal-600', desc: 'Balanced discovery across culture, nature, and dining' };
    return { label: 'Fast-Paced / Packed', color: 'text-amber-600', desc: 'Consider trimming 1 stop for a more comfortable day trip' };
  };

  const pace = getPaceAssessment();

  const handleSaveItinerary = async () => {
    if (itineraryItems.length === 0) {
      setSaveError('Please select at least 1 attraction before saving your 1-day itinerary (REQ-021).');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const items: ItineraryItem[] = itineraryItems.map((attraction, idx) => ({
        attractionId: attraction.id,
        attraction,
        timeSlot: getTimeSlot(idx) as any,
        order: idx + 1,
      }));

      const res = await api.saveItinerary({
        title: `${travelerName}'s Minuwangoda Day Tour`,
        travelerName,
        date: tripDate,
        items,
        totalDistanceKm: parseFloat(totalDirectDistance.toFixed(1)),
        notes: tripNotes,
      });

      setSavedResult(res);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save itinerary to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Planner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-700/60 text-emerald-200 border border-emerald-500/30 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>1-Day Visit Planner (Minuwangoda 25 km Hub)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personalized One-Day Itinerary
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Arrange your chosen destinations within 25 km of Minuwangoda into an optimized daily sequence with travel timings and etiquette guidance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onViewOnMap}
              className="bg-emerald-700/80 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-emerald-500/40 flex items-center gap-1.5 shadow-sm"
            >
              <Route className="w-4 h-4" />
              <span>View Route on Map</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={itineraryItems.length === 0}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-white/20 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Export</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Total Stops
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalAttractions}</span>
            <span className="text-[11px] text-emerald-200/80 block mt-0.5">Destinations selected</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Total Distance
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {totalDirectDistance.toFixed(1)} km
            </span>
            <span className="text-[11px] text-emerald-200/80 block mt-0.5">From Minuwangoda</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Est. Day Duration
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalDayHours} hrs</span>
            <span className="text-[11px] text-emerald-200/80 block mt-0.5">Visits + road transit</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Itinerary Pace
            </span>
            <span className={`text-sm sm:text-base font-bold ${pace.color} drop-shadow-sm block mt-1`}>
              {pace.label}
            </span>
            <span className="text-[10px] text-emerald-200/80 block line-clamp-1">{pace.desc}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8">
        {/* REQ-021: Empty State handling */}
        {itineraryItems.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              Your 1-Day Itinerary is Currently Empty
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Browse the curated catalog of attractions within 25 km of Minuwangoda above and click{' '}
              <span className="font-semibold text-emerald-700">"Add to Day Plan"</span> to assemble your customized journey.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Recommended: Select 2 to 4 places for an optimal relaxed day tour.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Travel details config bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Traveler Name / Group
                </label>
                <input
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Silva Family"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Planned Visit Date
                </label>
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Trip Notes / Priorities
                </label>
                <input
                  type="text"
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Remember white clothes for temples"
                />
              </div>
            </div>

            {/* Sequence list of attractions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Ordered 1-Day Itinerary Sequence</span>
                <span className="text-emerald-700">Drag or use arrows to adjust order</span>
              </div>

              {itineraryItems.map((item, index) => {
                const timeSlot = getTimeSlot(index);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all gap-4"
                  >
                    {/* Left: Step number & Slot */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-300">
                        {index + 1}
                      </div>

                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block">
                          {timeSlot}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {item.distance_km} km from Minuwangoda
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.opening_hours}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-colors"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === itineraryItems.length - 1}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-colors"
                          title="Move later"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent hover:border-rose-200"
                        title="Remove from itinerary (REQ-018)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Guidelines Checklist for the Planned Day */}
            <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1-Day Tour Preparation Checklist</span>
              </h4>
              <ul className="text-xs sm:text-sm text-emerald-900 space-y-1.5">
                <li>• <strong>Starting Point:</strong> Minuwangoda Town Center or Bandaranaike International Airport vicinity.</li>
                <li>• <strong>Dress Requirements:</strong> Ensure you have light modest clothing / shawl for religious heritage sites like Asgiriya, Kelaniya, or Attanagalla.</li>
                <li>• <strong>Hydration & Weather:</strong> Carry bottled water and sunscreen for open coastal and botanical garden strolls.</li>
                <li>• <strong>Transport:</strong> Local tuk-tuks or metered hire cars are available at Minuwangoda bus stand and junction.</li>
              </ul>
            </div>

            {/* Error or Success notification */}
            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs sm:text-sm rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {savedResult && (
              <div className="p-4 bg-emerald-50 text-emerald-900 text-xs sm:text-sm rounded-2xl border border-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Itinerary Saved to MongoDB Storage!</span>
                    <p className="text-emerald-700 text-xs">
                      Reference ID: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{savedResult.id}</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={onClearItinerary}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Clear Entire Plan
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSaveItinerary}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save Itinerary'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
