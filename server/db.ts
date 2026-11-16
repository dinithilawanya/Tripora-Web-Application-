import mongoose, { Schema, Model } from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_ATTRACTIONS } from '../src/data/initialAttractions';
import { Attraction, SavedItinerary } from '../src/types';

// ======================== MONGOOSE SCHEMAS & MODELS ========================

const AttractionSchema = new Schema<Attraction>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    distance_km: { type: Number, required: true, min: 0.1, max: 25 },
    description: { type: String, required: true },
    opening_hours: { type: String, required: true },
    location_coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    travel_tips: { type: String, required: true },
    dress_code: { type: String },
    best_time: { type: String },
    entry_fee: { type: String },
    family_friendly: { type: Boolean, default: true },
    parking_available: { type: Boolean, default: true },
    image_url: { type: String, required: true },
    gallery: { type: [String], default: [] },
    estimated_duration_mins: { type: Number, default: 60 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ItinerarySchema = new Schema<SavedItinerary>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    travelerName: { type: String, required: true },
    date: { type: String, required: true },
    items: { type: Schema.Types.Mixed, required: true },
    totalDistanceKm: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    createdAt: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export interface AdminRecord {
  username: string;
  passwordHash: string;
  salt: string;
}

const AdminSchema = new Schema<AdminRecord>(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

interface SessionRecord {
  token: string;
  createdAt: Date;
}

const SessionSchema = new Schema<SessionRecord>(
  {
    token: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // 7 days TTL
  },
  {
    versionKey: false,
  }
);

const AttractionModel: Model<Attraction> =
  mongoose.models.Attraction || mongoose.model<Attraction>('Attraction', AttractionSchema);

const ItineraryModel: Model<SavedItinerary> =
  mongoose.models.Itinerary || mongoose.model<SavedItinerary>('Itinerary', ItinerarySchema);

const AdminModel: Model<AdminRecord> =
  mongoose.models.Admin || mongoose.model<AdminRecord>('Admin', AdminSchema);

const SessionModel: Model<SessionRecord> =
  mongoose.models.Session || mongoose.model<SessionRecord>('Session', SessionSchema);

// ======================== LOCAL JSON FALLBACK ========================

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tripora-db.json');

interface LocalDatabaseSchema {
  attractions: Attraction[];
  itineraries: SavedItinerary[];
  admins: AdminRecord[];
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function getDefaultAdmin(): AdminRecord {
  const defaultSalt = 'tripora_salt_2026';
  return {
    username: 'admin',
    salt: defaultSalt,
    passwordHash: hashPassword('tripora2026', defaultSalt),
  };
}

let localDb: LocalDatabaseSchema | null = null;
const localSessions = new Set<string>();
let usingMongo = false;
let mongoConnectionStatus = 'Local JSON Fallback';

function initLocalFallback(): LocalDatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.attractions) && parsed.attractions.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read local fallback db file, re-initializing', e);
    }
  }

  const initialData: LocalDatabaseSchema = {
    attractions: [...INITIAL_ATTRACTIONS],
    itineraries: [],
    admins: [getDefaultAdmin()],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

function saveLocalFallback() {
  if (!localDb) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting local fallback database:', err);
  }
}

function stripMongoFields<T extends object>(doc: T): Omit<T, '_id' | 'createdAt' | 'updatedAt'> {
  const { _id, ...rest } = doc as T & { _id?: unknown };
  return rest as Omit<T, '_id' | 'createdAt' | 'updatedAt'>;
}

// ======================== INITIALIZATION ========================

export async function initDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 6000,
      });
      usingMongo = true;
      mongoConnectionStatus = 'MongoDB (Connected)';

      // Seed initial attractions if empty
      const attractionCount = await AttractionModel.countDocuments();
      if (attractionCount === 0) {
        await AttractionModel.insertMany(INITIAL_ATTRACTIONS);
        console.log(`🌱 Seeded ${INITIAL_ATTRACTIONS.length} attractions into MongoDB`);
      }

      // Seed default admin if empty
      const adminCount = await AdminModel.countDocuments();
      if (adminCount === 0) {
        await AdminModel.create(getDefaultAdmin());
        console.log('🔐 Seeded default admin account into MongoDB');
      }

      return;
    } catch (err) {
      console.error('❌ MongoDB connection failed, falling back to local JSON store:', err);
      usingMongo = false;
      mongoConnectionStatus = 'Local JSON Fallback (MongoDB connection failed)';
    }
  } else {
    console.warn('⚠️  MONGODB_URI is not set. Using local JSON file fallback (data/tripora-db.json).');
    usingMongo = false;
    mongoConnectionStatus = 'Local JSON Fallback (Set MONGODB_URI secret)';
  }

  localDb = initLocalFallback();
}

export function isMongoConnected(): boolean {
  return usingMongo && mongoose.connection.readyState === 1;
}

export function getDatabaseStatusLabel(): string {
  return isMongoConnected() ? 'MongoDB (Connected)' : mongoConnectionStatus;
}

// ======================== DATA ACCESS LAYER ========================

export interface AttractionFilterParams {
  category?: string;
  search?: string;
  maxDistance?: number;
  sortBy?: 'distance' | 'name' | 'category';
}

export const dbStore = {
  async getStats() {
    const attractions = await this.listAttractions({});
    const total = attractions.length;
    const categoriesCount: Record<string, number> = {};
    let totalDist = 0;

    for (const item of attractions) {
      categoriesCount[item.category] = (categoriesCount[item.category] || 0) + 1;
      totalDist += item.distance_km;
    }

    return {
      totalAttractions: total,
      categoriesCount,
      avgDistanceKm: total > 0 ? parseFloat((totalDist / total).toFixed(1)) : 0,
      radiusLimitKm: 25,
      centerLocation: 'Minuwangoda Town Center (7.1652° N, 79.9547° E)',
      database: getDatabaseStatusLabel(),
    };
  },

  async listAttractions(filters: AttractionFilterParams): Promise<Attraction[]> {
    if (isMongoConnected()) {
      const query: Record<string, unknown> = {};

      if (filters.category && filters.category !== 'All') {
        query.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.search) {
        const q = filters.search.trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { travel_tips: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ];
      }

      if (filters.maxDistance !== undefined && !isNaN(filters.maxDistance)) {
        query.distance_km = { $lte: filters.maxDistance };
      }

      const sortObj: Record<string, 1 | -1> = {};
      if (filters.sortBy === 'distance') sortObj.distance_km = 1;
      else if (filters.sortBy === 'name') sortObj.name = 1;
      else if (filters.sortBy === 'category') sortObj.category = 1;

      const docs = await AttractionModel.find(query).sort(sortObj).lean();
      return docs.map((d) => stripMongoFields(d) as unknown as Attraction);
    }

    let list = [...(localDb?.attractions || [])];
    if (filters.category && filters.category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.travel_tips.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    if (filters.maxDistance !== undefined && !isNaN(filters.maxDistance)) {
      list = list.filter((a) => a.distance_km <= filters.maxDistance!);
    }
    if (filters.sortBy === 'distance') {
      list.sort((a, b) => a.distance_km - b.distance_km);
    } else if (filters.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category));
    }
    return list;
  },

  async getAttractionById(id: string): Promise<Attraction | null> {
    if (isMongoConnected()) {
      const doc = await AttractionModel.findOne({ id }).lean();
      return doc ? (stripMongoFields(doc) as unknown as Attraction) : null;
    }
    return localDb?.attractions.find((a) => a.id === id) || null;
  },

  async createAttraction(attraction: Attraction): Promise<Attraction> {
    if (isMongoConnected()) {
      const created = await AttractionModel.create(attraction);
      return stripMongoFields(created.toObject()) as unknown as Attraction;
    }
    localDb!.attractions.push(attraction);
    saveLocalFallback();
    return attraction;
  },

  async updateAttraction(id: string, updateData: Partial<Attraction>): Promise<Attraction | null> {
    if (isMongoConnected()) {
      const { id: _ignored, ...safeUpdate } = updateData;
      const updated = await AttractionModel.findOneAndUpdate(
        { id },
        { $set: safeUpdate },
        { new: true, runValidators: true }
      ).lean();
      return updated ? (stripMongoFields(updated) as unknown as Attraction) : null;
    }

    const index = localDb!.attractions.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const existing = localDb!.attractions[index];
    const updated: Attraction = {
      ...existing,
      ...updateData,
      id: existing.id,
    };
    localDb!.attractions[index] = updated;
    saveLocalFallback();
    return updated;
  },

  async deleteAttraction(id: string): Promise<Attraction | null> {
    if (isMongoConnected()) {
      const deleted = await AttractionModel.findOneAndDelete({ id }).lean();
      return deleted ? (stripMongoFields(deleted) as unknown as Attraction) : null;
    }

    const index = localDb!.attractions.findIndex((a) => a.id === id);
    if (index === -1) return null;
    const removed = localDb!.attractions.splice(index, 1)[0];
    saveLocalFallback();
    return removed;
  },

  async resetAttractions(): Promise<Attraction[]> {
    if (isMongoConnected()) {
      await AttractionModel.deleteMany({});
      await AttractionModel.insertMany(INITIAL_ATTRACTIONS);
      const docs = await AttractionModel.find({}).lean();
      return docs.map((d) => stripMongoFields(d) as unknown as Attraction);
    }

    localDb!.attractions = [...INITIAL_ATTRACTIONS];
    saveLocalFallback();
    return localDb!.attractions;
  },

  async findAdminByUsername(username: string): Promise<AdminRecord | null> {
    const normalized = username.toLowerCase().trim();
    if (isMongoConnected()) {
      const doc = await AdminModel.findOne({ username: normalized }).lean();
      return doc ? (stripMongoFields(doc) as unknown as AdminRecord) : null;
    }
    return localDb!.admins.find((a) => a.username.toLowerCase() === normalized) || null;
  },

  async createSession(token: string): Promise<void> {
    if (isMongoConnected()) {
      await SessionModel.create({ token });
      return;
    }
    localSessions.add(token);
  },

  async hasSession(token: string): Promise<boolean> {
    if (isMongoConnected()) {
      const exists = await SessionModel.exists({ token });
      return Boolean(exists);
    }
    return localSessions.has(token);
  },

  async deleteSession(token: string): Promise<void> {
    if (isMongoConnected()) {
      await SessionModel.deleteOne({ token });
      return;
    }
    localSessions.delete(token);
  },

  async createItinerary(itinerary: SavedItinerary): Promise<SavedItinerary> {
    if (isMongoConnected()) {
      const created = await ItineraryModel.create(itinerary);
      const obj = created.toObject();
      const { _id, ...rest } = obj;
      return rest as SavedItinerary;
    }
    localDb!.itineraries.push(itinerary);
    saveLocalFallback();
    return itinerary;
  },

  async getItineraryById(id: string): Promise<SavedItinerary | null> {
    if (isMongoConnected()) {
      const doc = await ItineraryModel.findOne({ id }).lean();
      if (!doc) return null;
      const { _id, ...rest } = doc;
      return rest as SavedItinerary;
    }
    return localDb!.itineraries.find((it) => it.id === id) || null;
  },
};
