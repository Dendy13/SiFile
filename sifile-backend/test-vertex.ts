import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const project = process.env.FIREBASE_PROJECT_ID || 'sifile-app';
const location = 'us-central1';
const ai = new GoogleGenAI({ project, location, vertexai: true });

async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "hello world" if you can hear me.',
    });
    console.log('SUCCESS:', res.text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
run();
