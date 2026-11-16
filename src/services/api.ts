import { Attraction, SavedItinerary, SystemStats } from '../types';
import { INITIAL_ATTRACTIONS } from '../data/initialAttractions';

const TOKEN_KEY = 'tripora_admin_token';
const ITINERARY_CACHE_KEY = 'tripora_active_itinerary';

export const api = {
  // Get active session token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Attractions API
  async getAttractions(params?: {
    category?: string;
    search?: string;
    maxDistance?: number;
    sortBy?: 'distance' | 'name' | 'category';
  }): Promise<Attraction[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.maxDistance) query.append('maxDistance', params.maxDistance.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);

      const res = await fetch(`/api/attractions?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch attractions');
      return await res.json();
    } catch (e) {
      console.warn('API error fetching attractions, falling back to local dataset', e);
      // Client-side fallback if server is starting up
      let data = [...INITIAL_ATTRACTIONS];
      if (params?.category && params.category !== 'All') {
        data = data.filter((a) => a.category.toLowerCase().includes(params.category!.toLowerCase()));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        data = data.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
      }
      if (params?.maxDistance) {
        data = data.filter((a) => a.distance_km <= params.maxDistance!);
      }
      if (params?.sortBy === 'distance') {
        data.sort((a, b) => a.distance_km - b.distance_km);
      }
      return data;
    }
  },

  async getAttraction(id: string): Promise<Attraction | null> {
    try {
      const res = await fetch(`/api/attractions/${id}`);
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch {
      return INITIAL_ATTRACTIONS.find((a) => a.id === id) || null;
    }
  },

  async createAttraction(data: Partial<Attraction>): Promise<Attraction> {
    const token = this.getToken();
    const res = await fetch('/api/attractions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create attraction');
    }
    return await res.json();
  },

  async updateAttraction(id: string, data: Partial<Attraction>): Promise<Attraction> {
    const token = this.getToken();
    const res = await fetch(`/api/attractions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update attraction');
    }
    return await res.json();
  },

  async deleteAttraction(id: string): Promise<{ message: string; deletedId: string }> {
    const token = this.getToken();
    const res = await fetch(`/api/attractions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete attraction');
    }
    return await res.json();
  },

  async resetAttractions(): Promise<Attraction[]> {
    const token = this.getToken();
    const res = await fetch('/api/attractions/reset', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    });
    if (!res.ok) throw new Error('Failed to reset catalog');
    const data = await res.json();
    return data.attractions;
  },

  // Auth API
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    this.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    this.clearToken();
  },

  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // System Stats
  async getStats(): Promise<SystemStats> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Stats error');
      return await res.json();
    } catch {
      return {
        totalAttractions: INITIAL_ATTRACTIONS.length,
        categoriesCount: {
          'Heritage / Religious': 5,
          'Nature / Parks': 1,
          'Nature / Wildlife': 1,
          'Sightseeing / Theme Park': 1,
          'Coastal / Sightseeing': 2,
          'Cultural / Heritage': 1,
          'Cultural / Religious': 1,
          'Nature / Agro-Tourism': 1,
        },
        avgDistanceKm: 15.3,
        radiusLimitKm: 25,
        centerLocation: 'Minuwangoda Town Center',
        database: 'MongoDB Document Storage (Persistent Store)',
      };
    }
  },

  // Itinerary API
  async saveItinerary(itinerary: Partial<SavedItinerary>): Promise<SavedItinerary> {
    const res = await fetch('/api/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itinerary),
    });
    if (!res.ok) throw new Error('Failed to save itinerary');
    return await res.json();
  },

  async getSavedItinerary(id: string): Promise<SavedItinerary | null> {
    try {
      const res = await fetch(`/api/itineraries/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Local storage backup for active itinerary
  loadLocalItinerary(): any[] {
    try {
      const stored = localStorage.getItem(ITINERARY_CACHE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveLocalItinerary(items: any[]) {
    try {
      localStorage.setItem(ITINERARY_CACHE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  },
};
