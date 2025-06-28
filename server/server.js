require('dotenv').config();
const express = require('express');
const axios = require('axios');
const connectDB = require('./config/database');
const Event = require('./models/Event');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/events', async (req, res) => {
  try {
    const { q = 'concert', page = 1, per_page = 20, type = '', save = 'false' } = req.query;
    
    const params = {
      q,
      page,
      per_page,
      client_id: process.env.SEATGEEK_CLIENT_ID || 'your_client_id_here',
      client_secret: process.env.SEATGEEK_CLIENT_SECRET
    };

    // Add type filter for concerts and music festivals
    if (type) {
      params.type = type;
    } else {
      // Default to concerts and music festivals if no type specified
      params.type = ['concert', 'music_festival'].join(',');
    }
    
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
      artist, 
      from_date, 
      to_date 
    } = req.query;

    const filter = {};
    
    // Add city filter
    if (city) {
      filter['venue.city'] = new RegExp(city, 'i');
    }
    
    // Add artist filter
    if (artist) {
      filter['performers.name'] = new RegExp(artist, 'i');
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