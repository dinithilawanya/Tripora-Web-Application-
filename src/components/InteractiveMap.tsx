import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Attraction } from '../types';
import { MapPin, Navigation, Eye, Plus, Check } from 'lucide-react';

interface InteractiveMapProps {
  attractions: Attraction[];
  selectedAttraction?: Attraction | null;
  onSelectAttraction: (attraction: Attraction) => void;
  itineraryAttractionIds: string[];
  onToggleItinerary: (attraction: Attraction) => void;
  showItineraryRoute?: boolean;
}

const MINUWANGODA_CENTER: [number, number] = [7.1652, 79.9547];
const RADIUS_METERS = 25000; // 25 km scope defined in SRS

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  attractions,
  selectedAttraction,
  onSelectAttraction,
  itineraryAttractionIds,
  onToggleItinerary,
  showItineraryRoute = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Category color mapping
  const getCategoryColor = (category: string) => {
    if (category.includes('Religious') || category.includes('Heritage')) return '#d97706'; // Amber / gold
    if (category.includes('Nature') || category.includes('Parks') || category.includes('Wildlife')) return '#059669'; // Emerald
    if (category.includes('Coastal')) return '#0284c7'; // Sky / ocean
    if (category.includes('Agro')) return '#65a30d'; // Lime
    if (category.includes('Theme')) return '#9333ea'; // Purple
    return '#4f46e5'; // Indigo
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: MINUWANGODA_CENTER,
      zoom: 11,
      scrollWheelZoom: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // 25 km Radius circle for Minuwangoda
    const radiusCircle = L.circle(MINUWANGODA_CENTER, {
      radius: RADIUS_METERS,
      color: '#10b981',
      fillColor: '#34d399',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6, 8',
    }).addTo(map);

    radiusCircle.bindTooltip('25 km Minuwangoda Project Boundary', {
      permanent: false,
      direction: 'top',
    });

    // Minuwangoda Center Marker
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div style="background-color: #0f172a; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #10b981;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const centerMarker = L.marker(MINUWANGODA_CENTER, { icon: centerIcon }).addTo(map);
    centerMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <span style="font-size: 10px; font-weight: bold; color: #059669; text-transform: uppercase;">Central Origin Point</span>
        <h4 style="font-weight: 700; margin: 2px 0 4px 0; color: #0f172a; font-size: 15px;">Minuwangoda Town Center</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">
          All 10+ official tourist destinations cataloged strictly within a 25 km radius.
        </p>
      </div>
    `);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever attractions change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    attractions.forEach((place, index) => {
      const isSelected = selectedAttraction?.id === place.id;
      const isInItinerary = itineraryAttractionIds.includes(place.id);
      const color = getCategoryColor(place.category);

      const markerHtml = `
        <div style="
          background-color: ${isInItinerary ? '#047857' : color};
          color: white;
          width: ${isSelected ? '36px' : '30px'};
          height: ${isSelected ? '36px' : '30px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${isInItinerary ? '✓' : index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-place-marker',
        html: markerHtml,
        iconSize: isSelected ? [36, 36] : [30, 30],
        iconAnchor: isSelected ? [18, 18] : [15, 15],
      });

      const marker = L.marker([place.location_coords.lat, place.location_coords.lng], {
        icon: customIcon,
        title: place.name,
      });

      // Custom popup
      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.style.fontFamily = 'inherit';

      popupContent.innerHTML = `
        <div class="relative overflow-hidden rounded-t-lg mb-2" style="height: 80px; margin: -14px -14px 8px -14px;">
          <img src="${place.image_url}" alt="${place.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; bottom: 4px; right: 6px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${place.distance_km} km away
          </div>
        </div>
        <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">
          ${place.category}
        </div>
        <h4 style="font-weight: 700; margin: 2px 0 4px 0; color: #0f172a; font-size: 14px; line-height: 1.3;">
          ${place.name}
        </h4>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          ⏰ ${place.opening_hours}
        </div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button id="view-details-${place.id}" style="
            flex: 1;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 600;
            background-color: #0f172a;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">Details</button>
          <button id="toggle-itin-${place.id}" style="
            flex: 1;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 600;
            background-color: ${isInItinerary ? '#e2e8f0' : '#059669'};
            color: ${isInItinerary ? '#334155' : '#ffffff'};
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">${isInItinerary ? 'Remove' : '+ Add Plan'}</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const viewBtn = document.getElementById(`view-details-${place.id}`);
        const itinBtn = document.getElementById(`toggle-itin-${place.id}`);

        if (viewBtn) {
          viewBtn.onclick = () => onSelectAttraction(place);
        }
        if (itinBtn) {
          itinBtn.onclick = () => {
            onToggleItinerary(place);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectAttraction(place);
      });

      marker.addTo(markersLayer);
    });

    // Update itinerary polyline route if enabled
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (showItineraryRoute && itineraryAttractionIds.length > 0) {
      const orderedCoords: [number, number][] = [MINUWANGODA_CENTER];
      itineraryAttractionIds.forEach((id) => {
        const place = attractions.find((a) => a.id === id);
        if (place) {
          orderedCoords.push([place.location_coords.lat, place.location_coords.lng]);
        }
      });
      // Return to Minuwangoda loop
      orderedCoords.push(MINUWANGODA_CENTER);

      const routeLine = L.polyline(orderedCoords, {
        color: '#059669',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routeLayerRef.current = routeLine;
    }
  }, [attractions, selectedAttraction, itineraryAttractionIds, showItineraryRoute, onSelectAttraction, onToggleItinerary]);

  // If a specific attraction is selected from the UI cards, pan map to it
  useEffect(() => {
    if (selectedAttraction && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedAttraction.location_coords.lat, selectedAttraction.location_coords.lng],
        13,
        { duration: 1.2 }
      );
    }
  }, [selectedAttraction]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MINUWANGODA_CENTER, 11, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map HUD */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200/80 text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-800">25 km Radius Zone</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">{attractions.length} Attractions Loaded</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        <button
          onClick={handleResetView}
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl text-xs font-semibold shadow-md border border-slate-200 transition-all flex items-center gap-1.5"
          title="Center on Minuwangoda Hub"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Center Hub</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-slate-200 text-[11px] max-w-xs hidden sm:block">
        <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Category Color Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>Heritage & Temples</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Nature & Parks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            <span>Coastal & Lagoon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>Theme Parks & Sights</span>
          </div>
        </div>
      </div>
    </div>
  );
};
