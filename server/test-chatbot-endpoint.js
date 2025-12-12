require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testChatbot() {
  try {
    console.log('Testing chatbot with chat history...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro-latest',
      systemInstruction: "You are a Concert Concierge chatbot for Setlistd, a concert discovery platform. Help users find concerts, artists, and venues. Be friendly and helpful."
    });

    const chat = model.startChat({
      history: [],
    });

    console.log('Sending message...');
    const result = await chat.sendMessage('Hello');
    console.log('Got result, extracting text...');
    const text = result.response.text();
    console.log('SUCCESS:', text);

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testChatbot();
