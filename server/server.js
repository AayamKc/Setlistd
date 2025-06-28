require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/events', async (req, res) => {
  try {
    const { q = 'concert', page = 1, per_page = 20, type = '' } = req.query;
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});