require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  const modelNames = ['gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-pro-latest', 'gemini-1.0-pro'];
  
  for (const modelName of modelNames) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      const text = result.response.text();
      console.log(`SUCCESS with ${modelName}:`, text);
      return modelName; // Return working model
    } catch (error) {
      console.log(`${modelName} failed:`, error.message);
    }
  }
  console.log('No working models found');
}

testGemini();