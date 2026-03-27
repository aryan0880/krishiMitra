import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
console.log('genAI keys:', Object.keys(genAI));
if ((genAI as any).models) {
  console.log('genAI.models keys:', Object.keys((genAI as any).models));
}
console.log('genAI prototype keys:', Object.keys(Object.getPrototypeOf(genAI)));
