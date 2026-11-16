import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { Attraction, SavedItinerary } from './src/types';
import { initDatabase, dbStore, hashPassword, getDatabaseStatusLabel } from './server/db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Middleware to authenticate admin requests
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    }
    const token = authHeader.split(' ')[1];
    const valid = await dbStore.hasSession(token);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Authentication verification failed' });
  }
}

// ======================== API ROUTES ========================

// Health & System Statistics
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await dbStore.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve system statistics' });
  }
});

// GET /api/attractions - List attractions with search & filters (REQ-001, REQ-002, REQ-003)
app.get('/api/attractions', async (req: Request, res: Response) => {
  try {
    const { category, search, maxDistance, sortBy } = req.query;
    const parsedMax = maxDistance ? parseFloat(maxDistance as string) : undefined;
    const validSort =
      sortBy === 'distance' || sortBy === 'name' || sortBy === 'category' ? sortBy : undefined;

    const list = await dbStore.listAttractions({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      maxDistance: parsedMax !== undefined && !isNaN(parsedMax) ? parsedMax : undefined,
      sortBy: validSort,
    });

    res.json(list);
  } catch (err) {
    console.error('Error listing attractions:', err);
    res.status(500).json({ error: 'Failed to load attractions' });
  }
});

// GET /api/attractions/:id - Get specific attraction details (REQ-008 to REQ-014)
app.get('/api/attractions/:id', async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getAttractionById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Attraction not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching attraction:', err);
    res.status(500).json({ error: 'Failed to load attraction details' });
  }
});

// POST /api/attractions - Add new tourist attraction (Admin, REQ-022, REQ-023, REQ-024)
app.post('/api/attractions', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      distance_km,
      description,
      opening_hours,
      location_coords,
      travel_tips,
      dress_code,
      best_time,
      entry_fee,
      family_friendly,
      parking_available,
      image_url,
      estimated_duration_mins,
    } = req.body;

    if (!name || !category || distance_km === undefined || !description || !opening_hours) {
      return res.status(400).json({
        error: 'Missing required attraction fields: name, category, distance, description, opening_hours are mandatory',
      });
    }

    const dist = parseFloat(distance_km);
    if (isNaN(dist) || dist <= 0 || dist > 25) {
      return res.status(400).json({
        error: 'Attraction distance must be within the project scope (0.1 to 25.0 km from Minuwangoda)',
      });
    }

    const newAttraction: Attraction = {
      id: `att-${Date.now()}`,
      name: name.trim(),
      category,
      distance_km: dist,
      description: description.trim(),
      opening_hours: opening_hours.trim(),
      location_coords: location_coords || { lat: 7.1652, lng: 79.9547 },
      travel_tips: travel_tips || 'Visit during daylight hours and follow local guidelines.',
      dress_code: dress_code || 'Modest and comfortable attire.',
      best_time: best_time || 'Morning or late afternoon',
      entry_fee: entry_fee || 'Free',
      family_friendly: Boolean(family_friendly),
      parking_available: Boolean(parking_available),
      image_url: image_url || '/assets/aistudio/asgiriya1_a42f45e9.jpg',
      gallery: req.body.gallery || (image_url ? [image_url] : ['/assets/aistudio/asgiriya1_a42f45e9.jpg']),
      estimated_duration_mins: estimated_duration_mins ? parseInt(estimated_duration_mins, 10) : 60,
    };

    const created = await dbStore.createAttraction(newAttraction);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating attraction:', err);
    res.status(500).json({ error: 'Failed to create attraction' });
  }
});

// PUT /api/attractions/:id - Update existing attraction (Admin, REQ-025, REQ-026)
app.put('/api/attractions/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };

    if (updateData.distance_km !== undefined) {
      const dist = parseFloat(updateData.distance_km);
      if (isNaN(dist) || dist <= 0 || dist > 25) {
        return res.status(400).json({
          error: 'Attraction distance must be between 0.1 and 25.0 km from Minuwangoda',
        });
      }
      updateData.distance_km = dist;
    }

    const updated = await dbStore.updateAttraction(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating attraction:', err);
    res.status(500).json({ error: 'Failed to update attraction' });
  }
});

// DELETE /api/attractions/:id - Delete attraction (Admin, REQ-027, REQ-028)
app.delete('/api/attractions/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const removed = await dbStore.deleteAttraction(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    res.json({ message: `Successfully removed ${removed.name}`, deletedId: removed.id });
  } catch (err) {
    console.error('Error deleting attraction:', err);
    res.status(500).json({ error: 'Failed to delete attraction' });
  }
});

// POST /api/attractions/reset - Restore default verified places from SRS
app.post('/api/attractions/reset', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const attractions = await dbStore.resetAttractions();
    res.json({
      message: `Catalog reset to original ${attractions.length} Minuwangoda attractions`,
      attractions,
    });
  } catch (err) {
    console.error('Error resetting catalog:', err);
    res.status(500).json({ error: 'Failed to reset catalog' });
  }
});

// POST /api/auth/login - Admin Login (REQ-10, NFR-04)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await dbStore.findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const incomingHash = hashPassword(password, admin.salt);
    if (incomingHash !== admin.passwordHash) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = `trip_session_${crypto.randomBytes(24).toString('hex')}`;
    await dbStore.createSession(token);

    res.json({
      token,
      username: admin.username,
      message: 'Authentication successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/logout - Admin Logout
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await dbStore.deleteSession(token);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/verify - Verify current token
app.get('/api/auth/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const valid = await dbStore.hasSession(token);
      if (valid) {
        return res.json({ authenticated: true });
      }
    }
    res.status(401).json({ authenticated: false });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ authenticated: false });
  }
});

// POST /api/itineraries - Save 1-day itinerary (REQ-015 to REQ-020)
app.post('/api/itineraries', async (req: Request, res: Response) => {
  try {
    const { title, travelerName, items, totalDistanceKm, notes, date } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'An itinerary must contain at least one attraction' });
    }

    const newItinerary: SavedItinerary = {
      id: `itin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title || 'My Minuwangoda Day Tour',
      travelerName: travelerName || 'Curious Traveler',
      date: date || new Date().toISOString().split('T')[0],
      items,
      totalDistanceKm: totalDistanceKm || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    const created = await dbStore.createItinerary(newItinerary);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error saving itinerary:', err);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

// GET /api/itineraries/:id - Retrieve saved itinerary
app.get('/api/itineraries/:id', async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getItineraryById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error loading itinerary:', err);
    res.status(500).json({ error: 'Failed to retrieve itinerary' });
  }
});

// ======================== SERVER & VITE INTEGRATION ========================

async function startServer() {
  await initDatabase();

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================================`);
    console.log(`✈️  Tripora - Local Tourist Day-Visit Planner & Information System`);
    console.log(`📍 Serving Minuwangoda 25 km Tourist Hub`);
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📦 Database: ${getDatabaseStatusLabel()}`);
    console.log(`🔑 Admin credentials: username 'admin' / password 'tripora2026'`);
    console.log(`=================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
