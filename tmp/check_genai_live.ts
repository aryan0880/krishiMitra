import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

async function test() {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  try {
    const result = await (genAI.models as any).generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Say "test successful"' }] }]
    });
    console.log('Result keys:', Object.keys(result));
    console.log('Result.text:', result.text);
    if (result.response) {
       console.log('Result.response keys:', Object.keys(result.response));
    }
  } catch (e) {
    console.error('Test failed:', e);
  }
}
test();
