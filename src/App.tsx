/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Attraction, SavedItinerary } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AttractionList } from './components/AttractionList';
import { InteractiveMap } from './components/InteractiveMap';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { AttractionDetailModal } from './components/AttractionDetailModal';
import { AdminPortal } from './components/AdminPortal';
import { RegionalGuide } from './components/RegionalGuide';
import { Footer } from './components/Footer';
import {
  Compass,
  MapPin,
  Calendar,
  CheckCircle2,
  Route,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browse' | 'map' | 'itinerary' | 'guide'>('browse');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'category'>('distance');

  // Detail Modal State
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Admin Portal Modal
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Active Itinerary State (persisted in localStorage + backend)
  const [itineraryItems, setItineraryItems] = useState<Attraction[]>(() => {
    return api.loadLocalItinerary();
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Fetch attractions from Express API
  const fetchAttractions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAttractions();
      setAttractions(data);
    } catch (e) {
      console.error('Error loading attractions', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  // Sync itinerary to localStorage
  useEffect(() => {
    api.saveLocalItinerary(itineraryItems);
  }, [itineraryItems]);

  // Derive unique categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    attractions.forEach((a) => set.add(a.category));
    return ['All', ...Array.from(set)];
  }, [attractions]);

  // Filtered & Sorted attractions
  const filteredAttractions = useMemo(() => {
    let result = [...attractions];

    if (selectedCategory !== 'All') {
      result = result.filter((a) => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.travel_tips.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    if (maxDistance < 25) {
      result = result.filter((a) => a.distance_km <= maxDistance);
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => a.distance_km - b.distance_km);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [attractions, selectedCategory, searchQuery, maxDistance, sortBy]);

  // Add / Remove from Itinerary (REQ-015, REQ-018, REQ-019)
  const handleToggleItinerary = (place: Attraction) => {
    const exists = itineraryItems.some((item) => item.id === place.id);
    if (exists) {
      setItineraryItems((prev) => prev.filter((item) => item.id !== place.id));
      showToast(`Removed "${place.name}" from your 1-day plan.`);
    } else {
      setItineraryItems((prev) => [...prev, place]);
      showToast(`Added "${place.name}" to your 1-day plan!`);
    }
  };

  const handleOpenDetail = (place: Attraction) => {
    setSelectedAttraction(place);
    setIsDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMaxDistance(25);
    setSortBy('distance');
  };

  const itineraryIds = useMemo(() => itineraryItems.map((item) => item.id), [itineraryItems]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itineraryCount={itineraryItems.length}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Hero Section (only on Browse tab) */}
      {activeTab === 'browse' && (
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          totalAttractions={attractions.length}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: BROWSE ATTRACTONS */}
        {activeTab === 'browse' && (
          <div id="catalog-section" className="space-y-10">
            {/* Split layout: Filterable Cards + Sticky Map Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Place Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <AttractionList
                  attractions={filteredAttractions}
                  allCategories={allCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  maxDistance={maxDistance}
                  onMaxDistanceChange={setMaxDistance}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  selectedAttraction={selectedAttraction}
                  onSelectAttraction={handleOpenDetail}
                  itineraryAttractionIds={itineraryIds}
                  onToggleItinerary={handleToggleItinerary}
                  onResetFilters={handleResetFilters}
                />
              </div>

              {/* Right Column: Live 25 km Leaflet Map Preview (5 cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-md">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-800 text-sm">
                        25 km Interactive Radar
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <span>Expand Fullscreen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <InteractiveMap
                    attractions={filteredAttractions}
                    selectedAttraction={selectedAttraction}
                    onSelectAttraction={handleOpenDetail}
                    itineraryAttractionIds={itineraryIds}
                    onToggleItinerary={handleToggleItinerary}
                    showItineraryRoute={false}
                  />

                  {/* Itinerary quick drawer banner */}
                  <div className="mt-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        My 1-Day Plan: {itineraryItems.length} Places Selected
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {itineraryItems.length === 0
                          ? 'Add stops using "+ Add to Day Plan"'
                          : `${itineraryItems.reduce((acc, c) => acc + c.distance_km, 0).toFixed(1)} km total travel`}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <span>Review Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE 25KM MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geographical Scope Visualization</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Interactive 25 km Radius Map (Minuwangoda Gateway)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any marker to inspect opening hours, distances, and add to your customized one-day itinerary.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Go to 1-Day Itinerary ({itineraryItems.length})</span>
                </button>
              </div>
            </div>

            <InteractiveMap
              attractions={attractions}
              selectedAttraction={selectedAttraction}
              onSelectAttraction={handleOpenDetail}
              itineraryAttractionIds={itineraryIds}
              onToggleItinerary={handleToggleItinerary}
              showItineraryRoute={itineraryItems.length > 0}
            />
          </div>
        )}

        {/* TAB 3: 1-DAY ITINERARY PLANNER */}
        {activeTab === 'itinerary' && (
          <ItineraryPlanner
            itineraryItems={itineraryItems}
            onRemoveItem={(id) => {
              const place = attractions.find((a) => a.id === id);
              setItineraryItems((prev) => prev.filter((item) => item.id !== id));
              if (place) showToast(`Removed "${place.name}" from itinerary.`);
            }}
            onReorder={setItineraryItems}
            onClearItinerary={() => {
              if (window.confirm('Clear all attractions from your 1-day itinerary?')) {
                setItineraryItems([]);
                showToast('Cleared day plan.');
              }
            }}
            onViewOnMap={() => setActiveTab('map')}
          />
        )}

        {/* TAB 4: MINUWANGODA REGIONAL GUIDE */}
        {activeTab === 'guide' && <RegionalGuide />}
      </main>

      {/* Place Detail Profile Modal (REQ-008 to REQ-014) */}
      <AttractionDetailModal
        attraction={selectedAttraction}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAttraction(null);
        }}
        isInItinerary={selectedAttraction ? itineraryIds.includes(selectedAttraction.id) : false}
        onToggleItinerary={handleToggleItinerary}
      />

      {/* Admin Management Portal Modal (REQ-022 to REQ-029) */}
      {isAdminPortalOpen && (
        <AdminPortal
          attractions={attractions}
          onRefreshData={fetchAttractions}
          onClose={() => setIsAdminPortalOpen(false)}
        />
      )}

      {/* Footer with SRS & University of Moratuwa citations */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />
    </div>
  );
}
