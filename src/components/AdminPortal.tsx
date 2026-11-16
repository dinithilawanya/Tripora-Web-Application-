import React, { useState, useEffect } from 'react';
import { Attraction, SystemStats } from '../types';
import { api } from '../services/api';
import {
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  X,
  Save,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';

interface AdminPortalProps {
  attractions: Attraction[];
  onRefreshData: () => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: Attraction['category'][] = [
  'Heritage / Religious',
  'Nature / Parks',
  'Nature / Wildlife',
  'Sightseeing / Theme Park',
  'Coastal / Sightseeing',
  'Cultural / Heritage',
  'Cultural / Religious',
  'Nature / Agro-Tourism',
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  attractions,
  onRefreshData,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('tripora2026');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Modal / Form state for Add or Edit
  const [editingAttraction, setEditingAttraction] = useState<Partial<Attraction> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Deletion confirmation modal (REQ-028, NFR-03)
  const [deletingAttraction, setDeletingAttraction] = useState<Attraction | null>(null);

  // Check existing token on mount
  useEffect(() => {
    async function verify() {
      const isValid = await api.checkAuth();
      if (isValid) {
        setIsAuthenticated(true);
        loadStats();
      }
    }
    verify();
  }, []);

  const loadStats = async () => {
    const s = await api.getStats();
    setStats(s);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setLoginError(null);
      await api.login(username, password);
      setIsAuthenticated(true);
      await loadStats();
      onRefreshData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setFormError(null);
    setFormSuccess(null);
    setEditingAttraction({
      name: '',
      category: 'Heritage / Religious',
      distance_km: 10,
      description: '',
      opening_hours: '08:00 AM - 06:00 PM',
      location_coords: { lat: 7.1652, lng: 79.9547 },
      travel_tips: '',
      dress_code: 'Modest attire',
      best_time: 'Morning or afternoon',
      entry_fee: 'Free',
      family_friendly: true,
      parking_available: true,
      image_url: '/assets/aistudio/asgiriya1_a42f45e9.jpg',
      estimated_duration_mins: 60,
    });
  };

  const openEditModal = (attraction: Attraction) => {
    setIsCreatingNew(false);
    setFormError(null);
    setFormSuccess(null);
    setEditingAttraction({ ...attraction });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttraction) return;

    // REQ-024 Validation
    if (!editingAttraction.name?.trim()) {
      setFormError('Place Name is required (REQ-023).');
      return;
    }
    if (!editingAttraction.description?.trim()) {
      setFormError('Detailed Description is required.');
      return;
    }
    if (
      editingAttraction.distance_km === undefined ||
      editingAttraction.distance_km <= 0 ||
      editingAttraction.distance_km > 25
    ) {
      setFormError('Distance must be within 25 km of Minuwangoda (0.1 to 25.0 km).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (isCreatingNew) {
        await api.createAttraction(editingAttraction);
        setFormSuccess('New tourist place successfully registered in MongoDB!');
      } else if (editingAttraction.id) {
        await api.updateAttraction(editingAttraction.id, editingAttraction);
        setFormSuccess('Attraction record successfully updated!');
      }

      onRefreshData();
      await loadStats();
      setTimeout(() => {
        setEditingAttraction(null);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Error saving attraction data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // REQ-027, REQ-028 Deletion with Confirmation
  const confirmDelete = async () => {
    if (!deletingAttraction) return;
    try {
      setIsSubmitting(true);
      await api.deleteAttraction(deletingAttraction.id);
      setDeletingAttraction(null);
      onRefreshData();
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete attraction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCatalog = async () => {
    if (window.confirm('Reset all catalog places back to the original 12 Minuwangoda attractions?')) {
      await api.resetAttractions();
      onRefreshData();
      await loadStats();
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Tripora Administrative Management Portal</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SRS 4.4 & Table 9-10
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage attraction database records, operating hours, coordinates, and travel guidelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Logout ({username})
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isAuthenticated ? (
            /* Login Form (REQ-10, NFR-04) */
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Admin Authentication Required</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Please log in with administrator credentials to execute CRUD operations on the attractions catalog.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Demo System Credentials:</span>
                  <div className="font-mono mt-1 text-[11px] text-emerald-700">
                    Username: <strong>admin</strong> | Password: <strong>tripora2026</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Admin Management Interface */
            <div className="space-y-6">
              {/* Stats overview banner */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Catalog Places</span>
                    <span className="text-xl font-bold text-slate-900">{stats.totalAttractions}</span>
                    <span className="text-[10px] text-emerald-600 block">Min. requirement: &ge;10 places</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Geographic Scope</span>
                    <span className="text-xl font-bold text-slate-900">&le; 25 km</span>
                    <span className="text-[10px] text-slate-500 block">Minuwangoda Center</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Average Distance</span>
                    <span className="text-xl font-bold text-slate-900">{stats.avgDistanceKm} km</span>
                    <span className="text-[10px] text-slate-500 block">Within region</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Database Engine</span>
                    <span className="text-sm font-bold text-slate-900 truncate block mt-1">{stats.database}</span>
                    <span className="text-[10px] text-emerald-600 block">Collections Active</span>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Tourist Attraction (REQ-022)</span>
                  </button>
                  <button
                    onClick={handleResetCatalog}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                    title="Restore default 12 verified Minuwangoda attractions"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Reset Defaults</span>
                  </button>
                </div>
                <div className="text-xs text-slate-500 self-center">
                  Showing {attractions.length} attraction records
                </div>
              </div>

              {/* Attractions Data Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Place Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Distance</th>
                        <th className="py-3 px-4">Operating Hours</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attractions.map((place) => (
                        <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={place.image_url}
                                alt={place.name}
                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                              />
                              <div>
                                <span className="block font-bold">{place.name}</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {place.location_coords.lat.toFixed(3)}, {place.location_coords.lng.toFixed(3)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {place.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {place.distance_km} km
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {place.opening_hours}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(place)}
                                className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Edit details (REQ-025)"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingAttraction(place)}
                                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete record with confirmation (REQ-027)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Create or Edit Attraction Form */}
        {editingAttraction && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <h4 className="text-lg font-bold">
                  {isCreatingNew ? 'Add New Tourist Attraction' : `Edit: ${editingAttraction.name}`}
                </h4>
                <button
                  onClick={() => setEditingAttraction(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Attraction Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAttraction.name || ''}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Asgiriya Rajamaha Viharaya"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={editingAttraction.category}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Distance from Minuwangoda (km, &le; 25km) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="25"
                      required
                      value={editingAttraction.distance_km || ''}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, distance_km: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Opening Hours *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAttraction.opening_hours || ''}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, opening_hours: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 06:00 AM - 06:30 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingAttraction.description || ''}
                    onChange={(e) => setEditingAttraction({ ...editingAttraction, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Provide authentic historical, ecological, or sightseeing context..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingAttraction.location_coords?.lat || 7.1652}
                      onChange={(e) =>
                        setEditingAttraction({
                          ...editingAttraction,
                          location_coords: {
                            lat: parseFloat(e.target.value),
                            lng: editingAttraction.location_coords?.lng || 79.9547,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingAttraction.location_coords?.lng || 79.9547}
                      onChange={(e) =>
                        setEditingAttraction({
                          ...editingAttraction,
                          location_coords: {
                            lat: editingAttraction.location_coords?.lat || 7.1652,
                            lng: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Dress Code / Cultural Protocol
                    </label>
                    <input
                      type="text"
                      value={editingAttraction.dress_code || ''}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, dress_code: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                      placeholder="e.g. White attire, shoulders covered"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Entry Fee Info
                    </label>
                    <input
                      type="text"
                      value={editingAttraction.entry_fee || ''}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, entry_fee: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                      placeholder="e.g. Free admission / Rs. 100 ticket"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Travel & Crowd Tips
                  </label>
                  <input
                    type="text"
                    value={editingAttraction.travel_tips || ''}
                    onChange={(e) => setEditingAttraction({ ...editingAttraction, travel_tips: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    placeholder="e.g. Best in early morning, bring insect repellent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editingAttraction.image_url || ''}
                    onChange={(e) => setEditingAttraction({ ...editingAttraction, image_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAttraction.family_friendly || false}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, family_friendly: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Family / Child Friendly</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAttraction.parking_available || false}
                      onChange={(e) => setEditingAttraction({ ...editingAttraction, parking_available: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Parking Space Available</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAttraction(null)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save to Database'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmation Dialogue for Record Deletion (REQ-028 & NFR-03) */}
        {deletingAttraction && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 text-center mb-1">
                Confirm Attraction Deletion
              </h4>
              <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                In adherence to system safety requirement <strong>REQ-028 & NFR-03</strong>, please confirm you wish to permanently delete:
                <br />
                <span className="font-bold text-slate-800 text-sm block mt-1">"{deletingAttraction.name}"</span>
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAttraction(null)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
