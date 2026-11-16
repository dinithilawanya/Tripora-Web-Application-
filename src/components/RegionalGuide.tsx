import React from 'react';
import {
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sun,
  Trees,
  Car,
  HeartHandshake,
} from 'lucide-react';

export const RegionalGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-3">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Minuwangoda Regional Tourism Dossier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Minuwangoda is the Ideal 1-Day Gateway
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
            Situated centrally in Sri Lanka’s Gampaha District, Minuwangoda is located merely 12 to 15 kilometers from Bandaranaike International Airport (CMB). Rather than spending 4 to 6 hours traveling inland immediately after landing, travelers can discover authentic ancient cave temples, historic colonial canals, botanical gardens, and fresh ocean seafood right here within a strict 25 km radius.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-3">
              🏛️
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Cultural & Sacred Heritage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore Asgiriya cave shrine, King Sri Sangabo's Attanagalla sanctuary, and Kelaniya's hallowed riverbank murals without long travel fatigue.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
              🌿
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Ecology & Agro-Tourism</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stroll through Henarathgoda’s original 1876 rubber mother trees, observe flying squirrels in Horagolla National Park, and taste fresh rambutan in local orchards.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold mb-3">
              🌅
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Coastal & Lagoon Life</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Witness colorful catamaran sails at Browns Beach, explore Negombo’s 17th-century Dutch fortress, and sample fresh ocean prawns straight from the fishing harbor.
            </p>
          </div>
        </div>
      </div>

      {/* Practical Travel Rules & Cultural Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cultural Etiquette */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-lg">Temple Etiquette & Dress Code</h3>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                <strong>Modest Attire:</strong> Shoulders and knees must be covered at all Buddhist and religious sites (Asgiriya, Kelaniya, Attanagalla, St. Mary’s). White or light clothing is strongly appreciated.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                <strong>Footwear & Headwear:</strong> Shoes and caps must be removed before stepping onto temple sand terraces (shoe counters available at entrances for a small nominal tip).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                <strong>Photography Respect:</strong> Never pose with your back turned directly to a Buddha statue, and refrain from flash photography in historic painted sanctuaries.
              </span>
            </li>
          </ul>
        </div>

        {/* Local Transportation Advice */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
          <div className="flex items-center gap-2.5 text-emerald-900 font-bold mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="text-lg">Transportation & Getting Around</h3>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
              <span>
                <strong>Minuwangoda Hub:</strong> Centered at the Minuwangoda clock tower and bus stand, connecting Negombo road, Gampaha road, and Divulapitiya.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
              <span>
                <strong>Tuk-Tuk & Taxi Fares:</strong> Agree on metered rates or standard day-hire fees beforehand to bypass unregistered middleman commissions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
              <span>
                <strong>Day Tour Efficiency:</strong> Group nearby destinations together (e.g. Asgiriya + Botanical Garden + Farm in the morning, followed by Negombo Beach + Lagoon at sunset).
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sustainable Community Statement (from project brief) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Supporting Local Gampaha Communities</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Retaining Tourist Spend in Minuwangoda
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              By offering verified, transparent, and direct discovery tools, Tripora encourages travelers to spend locally with family-run agro-farms, artisan craft stalls, and authentic coastal dining—fostering community empowerment.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs shrink-0 max-w-xs">
            <span className="font-bold text-white block mb-1">Project Scope Statement:</span>
            <span className="text-emerald-100">
              Operates purely as an itinerary planning and informational portal. Excludes ticket booking, payments, and transport reservations to keep services neutral and accessible.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
