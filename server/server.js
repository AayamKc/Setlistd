require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/database');
const Event = require('./models/Event');
const supabase = require('./config/supabase'); // Supabase client
const { protect } = require('./middleware/authMiddleware'); // Auth middleware
const reviewRoutes = require('./routes/reviewRoutes');
const artistRoutes = require('./routes/artistRoutes');
const userRoutes = require('./routes/userRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default port
    'http://localhost:5174',  // Alternative Vite port
    'http://localhost:3000',  // Same origin
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://your-frontend-name.vercel.app',
    process.env.FRONTEND_URL                  
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Review Routes
app.use('/api/events', reviewRoutes);

// Artist Routes
app.use('/api/artists', artistRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// User Registration
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.user) {
      res.status(201).json({ message: 'User registered successfully', user: data.user });
    } else {
      res.status(200).json({ message: 'Please check your email for a confirmation link.' });
    }

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logged in successfully', session: data.session, user: data.user });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/protected-data', protect, async (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.user.email}! This is protected data.`, user: req.user });
});

// User Logout
app.post('/auth/logout', protect, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { 
      q = 'concert', 
      page = 1, 
      per_page = 20, 
      type = '', 
      save = 'false',
      city,
      from_date,
      to_date
    } = req.query;
    
    const params = {
      q,
      page,
      per_page,
      client_id: process.env.SEATGEEK_CLIENT_ID || 'your_client_id_here',
      client_secret: process.env.SEATGEEK_CLIENT_SECRET,
      'taxonomies.name': 'concert'
    };

    // Add city filter if provided
    if (city && city.trim()) {
      params['venue.city'] = city.trim();
    }

    // Add date range filters if provided (SeatGeek expects YYYY-MM-DD format)
    if (from_date && from_date.trim()) {
      params['datetime_local.gte'] = from_date.trim();
    }
    if (to_date && to_date.trim()) {
      params['datetime_local.lte'] = to_date.trim();
    }

    
    // Debug: Log the parameters being sent to SeatGeek API
    console.log('\n=== SEATGEEK API REQUEST ===');
    console.log('Parameters being sent:', params);
    console.log('Filters applied:', {
      city: city || 'none',
      from_date: from_date || 'none',
      to_date: to_date || 'none'
    });
    
    const response = await axios.get('https://api.seatgeek.com/2/events', {
      params
    });

    console.log(`\n=== SEATGEEK CONCERTS FETCHED ===`);
    console.log(`Query: "${q}", Page: ${page}, Per Page: ${per_page}`);
    console.log(`Total events found: ${response.data.meta?.total || 'unknown'}`);
    
    if (response.data.events && response.data.events.length > 0) {
      console.log('\nConcerts:');
      response.data.events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   Date: ${event.datetime_local}`);
        console.log(`   Venue: ${event.venue?.name}, ${event.venue?.city}`);
        console.log(`   Price: $${event.stats?.lowest_price || 'N/A'} - $${event.stats?.highest_price || 'N/A'}`);
        console.log('');
      });

      // Optionally save events to database
      if (save === 'true') {
        const savedEvents = [];
        for (const eventData of response.data.events) {
          try {
            const event = await Event.findOneAndUpdate(
              { seatgeekId: eventData.id },
              {
                seatgeekId: eventData.id,
                title: eventData.title,
                datetime_local: new Date(eventData.datetime_local),
                datetime_utc: eventData.datetime_utc ? new Date(eventData.datetime_utc) : undefined,
                url: eventData.url,
                venue: eventData.venue,
                performers: eventData.performers,
                stats: eventData.stats,
                taxonomies: eventData.taxonomies,
                type: eventData.type,
                status: eventData.status
              },
              { upsert: true, new: true }
            );
            savedEvents.push(event);
          } catch (saveError) {
            console.error(`Error saving event ${eventData.id}:`, saveError.message);
          }
        }
        console.log(`Saved ${savedEvents.length} events to database`);
      }
    } else {
      console.log('No concerts found');
    }
    console.log('================================\n');

    res.json(response.data);
  } catch (error) {
    console.error('SeatGeek API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events from SeatGeek' });
  }
});

// Clear all events from database
app.get('/api/clear-events', async (req, res) => {
  try {
    const result = await Event.deleteMany({});
    console.log(`Cleared ${result.deletedCount} events from database`);
    res.json({ 
      message: 'Successfully cleared all events', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing events:', error);
    res.status(500).json({ error: 'Failed to clear events' });
  }
});

// New endpoint to populate database with diverse concerts from multiple cities
app.get('/api/populate-concerts', async (req, res) => {
  try {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Atlanta', 'Miami', 'Dallas', 'Philadelphia', 'Phoenix', 'San Antonio', 'San Diego'];
    let allEvents = [];
    let totalSaved = 0;

    console.log('Starting diverse concert population...');

    for (const city of cities) {
      console.log(`\nFetching concerts from ${city}...`);
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= 3) { // Limit to 3 pages per city to avoid overwhelming
        const params = {
          'venue.city': city,
          'taxonomies.name': 'concert',
          'per_page': 20,
          page,
          client_id: process.env.SEATGEEK_CLIENT_ID,
          client_secret: process.env.SEATGEEK_CLIENT_SECRET
        };

        try {
          const response = await axios.get('https://api.seatgeek.com/2/events', { params });
          const meta = response.data.meta;
          totalPages = meta.total > 0 ? Math.ceil(meta.total / 20) : 0;

          console.log(`  Page ${page}/${Math.min(totalPages, 3)} - Found ${response.data.events.length} events`);

          // Save events to database
          for (const eventData of response.data.events) {
            try {
              const event = await Event.findOneAndUpdate(
                { seatgeekId: eventData.id },
                {
                  seatgeekId: eventData.id,
                  title: eventData.title,
                  datetime_local: new Date(eventData.datetime_local),
                  datetime_utc: eventData.datetime_utc ? new Date(eventData.datetime_utc) : undefined,
                  url: eventData.url,
                  venue: eventData.venue,
                  performers: eventData.performers,
                  stats: eventData.stats,
                  taxonomies: eventData.taxonomies,
                  type: eventData.type,
                  status: eventData.status
                },
                { upsert: true, new: true }
              );
              totalSaved++;
            } catch (saveError) {
              console.error(`Error saving event ${eventData.id}:`, saveError.message);
            }
          }

          allEvents = allEvents.concat(response.data.events);
          page++;
        } catch (cityError) {
          console.error(`Error fetching from ${city}, page ${page}:`, cityError.message);
          break;
        }
      }
    }

    console.log(`\n=== POPULATION COMPLETE ===`);
    console.log(`Total events fetched: ${allEvents.length}`);
    console.log(`Total events saved to database: ${totalSaved}`);

    res.json({
      message: 'Successfully populated concerts from multiple cities',
      totalFetched: allEvents.length,
      totalSaved: totalSaved,
      cities: cities
    });

  } catch (error) {
    console.error('Error populating concerts:', error);
    res.status(500).json({ error: 'Failed to populate concerts' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Setlistd API Server', status: 'running' });
});

// Get saved events from database
app.get('/api/saved-events', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      city,
      from_date, 
      to_date 
    } = req.query;

    const filter = {};
    
    // Add city filter
    if (city) {
      filter['venue.city'] = new RegExp(city, 'i');
    }
    
    // Add date range filter
    if (from_date || to_date) {
      filter.datetime_local = {};
      if (from_date) {
        filter.datetime_local.$gte = new Date(from_date);
      }
      if (to_date) {
        filter.datetime_local.$lte = new Date(to_date);
      }
    }

    const skip = (page - 1) * limit;
    
    const events = await Event.find(filter)
      .sort({ datetime_local: 1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Event.countDocuments(filter);
    
    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch saved events' });
  }
});

// Get event by ID
app.get('/api/saved-events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Delete saved event
app.delete('/api/saved-events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Database deletion error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});