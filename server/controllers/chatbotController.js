require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize the Gemini client
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  // We don't throw here to allow the server to start, but the chatbot will not work.
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tool definition for the AI model
const tools = [
  {
    functionDeclarations: [
      {
        name: 'searchEvents',
        description: 'Searches for concerts and events based on a query, city, and date range.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'The search query, such as an artist name, genre, or event type. E.g., "Rock", "Taylor Swift".',
            },
            city: {
              type: 'STRING',
              description: 'The city to search for events in. E.g., "Chicago", "New York".',
            },
            from_date: {
              type: 'STRING',
              description: 'The start date for the search in YYYY-MM-DD format.',
            },
            to_date: {
              type: 'STRING',
              description: 'The end date for the search in YYYY-MM-DD format.',
            },
          },
          required: [],
        },
      },
    ],
  },
];

// The actual function that implements the "searchEvents" tool
async function searchEvents({ query, city, from_date, to_date }) {
  console.log(`[Tool Execution] Searching events with:`, { query, city, from_date, to_date });

  if (!process.env.SEATGEEK_CLIENT_ID || !process.env.SEATGEEK_CLIENT_SECRET) {
    console.error('[Tool Error] SeatGeek API keys are not configured on the server.');
    return { error: 'The server is not configured for event searches. Missing API keys.' };
  }

  try {
    const params = {
      q: query || 'concert', // Default to 'concert' if no query
      client_id: process.env.SEATGEEK_CLIENT_ID,
      client_secret: process.env.SEATGEEK_CLIENT_SECRET,
      'taxonomies.name': 'concert',
      per_page: 10, // Limit results for chatbot
    };

    if (city) params['venue.city'] = city.trim();
    if (from_date) params['datetime_local.gte'] = from_date.trim();
    if (to_date) params['datetime_local.lte'] = to_date.trim();

    const response = await axios.get('https://api.seatgeek.com/2/events', { params });

    if (!response.data.events || response.data.events.length === 0) {
      return { summary: 'No events found matching the criteria.' };
    }

    // Simplify the event data for the model
    const simplifiedEvents = response.data.events.map(event => ({
      title: event.title,
      date: event.datetime_local,
      venue: event.venue?.name,
      city: event.venue?.city,
    }));

    return {
      summary: `Found ${simplifiedEvents.length} events.`,
      events: simplifiedEvents,
    };
  } catch (error) {
    console.error('Error in searchEvents tool:', error.message);
    return { error: 'Failed to fetch events from SeatGeek.' };
  }
}

// The main controller function to handle chat requests
const handleChat = async (req, res) => {
  console.log('=== CHATBOT REQUEST DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Method:', req.method);
  
  try {
    console.log('Checking API key...');
    if (!process.env.GEMINI_API_KEY) {
      console.log('ERROR: No API key found');
      return res.status(500).json({ error: 'The chatbot is not configured on the server.' });
    }
    console.log('API key exists');

    const { message, history } = req.body;
    console.log('Message:', message);
    console.log('History length:', history?.length || 0);

    if (!message) {
      console.log('ERROR: No message provided');
      return res.status(400).json({ error: 'Message is required.' });
    }

    console.log('Creating Gemini model...');
    // Start with basic model without tools to test basic functionality
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro-latest',
      systemInstruction: "You are a Concert Concierge chatbot for Setlistd, a concert discovery platform. Help users find concerts, artists, and venues. Be friendly and helpful."
    });
    console.log('Model created');

    console.log('Starting chat...');
    const chat = model.startChat({
      history: history || [],
    });
    console.log('Chat started');

    console.log('Sending message to Gemini...');
    const result = await chat.sendMessage(message);
    console.log('Got response from Gemini');
    
    const text = result.response.text();
    console.log('Response text extracted:', text.substring(0, 100));
    
    res.json({ response: text });

  } catch (error) {
    console.error('Chatbot controller error:', error.message);
    console.error('Full error object:', error);
    
    // Handle quota exceeded errors specifically
    if (error.message.includes('quota') || error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'The chatbot is temporarily unavailable due to quota limits. Please try again later.' 
      });
    }
    
    res.status(500).json({ error: 'An error occurred while processing your message.' });
  }
};

module.exports = { handleChat };
