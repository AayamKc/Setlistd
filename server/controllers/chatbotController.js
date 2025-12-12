require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize the Gemini client
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables.');
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
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro', tools });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      console.log('[AI] Function call requested:', call.name, call.args);

      // Call the tool function
      const toolResult = await searchEvents(call.args);

      // Send the tool result back to the model
      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: 'searchEvents',
            response: toolResult,
          },
        },
      ]);
      
      // Get the model's final text response
      const finalResponse = result2.response.candidates[0].content.parts[0].text;
      res.json({ response: finalResponse });

    } else if (response.candidates && response.candidates.length > 0) {
      // If it's a simple text response
      const text = response.candidates[0].content.parts[0].text;
      res.json({ response: text });
    } else {
      res.json({ response: "I'm not sure how to respond to that. Please try asking about concerts." });
    }
  } catch (error) {
    console.error('Chatbot controller error:', error);
    res.status(500).json({ error: 'An error occurred while processing your message.' });
  }
};

module.exports = { handleChat };
