export interface Attraction {
  id: string;
  name: string;
  category: 'Heritage / Religious' | 'Nature / Parks' | 'Nature / Wildlife' | 'Sightseeing / Theme Park' | 'Coastal / Sightseeing' | 'Cultural / Heritage' | 'Cultural / Religious' | 'Nature / Agro-Tourism';
  distance_km: number;
  description: string;
  opening_hours: string;
  location_coords: {
    lat: number;
    lng: number;
  };
  travel_tips: string;
  dress_code?: string;
  best_time?: string;
  entry_fee?: string;
  family_friendly: boolean;
  parking_available: boolean;
  image_url: string;
  gallery?: string[];
  estimated_duration_mins: number;
}

export interface ItineraryItem {
  attractionId: string;
  attraction: Attraction;
  timeSlot: 'Morning (8:00 AM - 12:00 PM)' | 'Midday / Lunch (12:00 PM - 2:30 PM)' | 'Afternoon (2:30 PM - 5:00 PM)' | 'Evening / Sunset (5:00 PM - 7:30 PM)';
  order: number;
  notes?: string;
}

export interface SavedItinerary {
  id: string;
  title: string;
  travelerName: string;
  date: string;
  items: ItineraryItem[];
  totalDistanceKm: number;
  createdAt: string;
  notes?: string;
}

export interface AdminUser {
  username: string;
  token: string;
}

export interface SystemStats {
  totalAttractions: number;
  categoriesCount: Record<string, number>;
  avgDistanceKm: number;
  radiusLimitKm: number;
  centerLocation: string;
  database: string;
}
