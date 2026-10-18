import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.static('public'));

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Load playbooks if present
let playbooks = {};
try {
  playbooks = JSON.parse(fs.readFileSync(new URL('./playbooks.json', import.meta.url)));
} catch (e) {
  console.warn("Could not load playbooks.json, proceeding without local playbooks.");
}

const EL = 'https://api.elevenlabs.io/v1';
const elKey = () => ({ 'xi-api-key': process.env.ELEVENLABS_API_KEY });

const toParts = c => typeof c === 'string' ? [{ text: c }] : c.map(b => b.type === 'text' ? { text: b.text } : { inlineData: { mimeType: b.source.media_type, data: b.source.data } });

// JSON Parsing Helper
const parseJson = (t) => {
  let clean = t.replace(/```json|```/g, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error on raw text:", t);
    return {
      scenario: "other",
      guide: {
        summary: "The assistant returned a malformed response. Please try rephrasing your situation.",
        do_now: ["Review your details and try your request again."],
        bring: [],
        say: [],
        watch_out: []
      },
      facts: [],
      script: []
    };
  }
};

const SYSTEM = `You help international newcomers handle essential services in their destination country.
You receive what the user said, the target country, and target language.
Return ONLY valid JSON (no markdown) in the requested shape.`;

const shapeFor = (language, they) => `Return ONLY valid JSON, no markdown, exactly this shape:
{
  "scenario": "bank" | "gp" | "landlord" | "shopping" | "visa" | "other",
  "title": "short title",
  "guide": {
    "summary": "2-3 plain sentences explaining what is going on written in ${language || 'English'}",
    "do_now": ["short imperative steps written in ${language || 'English'}"],
    "bring": ["documents or items to bring written in ${language || 'English'}"],
    "say": [{ "them": "a short polite sentence the user can show or say, in ${they || 'English'}", "me": "the same sentence translated in ${language || 'English'}" }],
    "watch_out": ["pitfalls or scams to avoid written in ${language || 'English'}"]
  },
  "facts": [{ "label": "e.g. Deadline", "value": "e.g. 14 March" }]
}
Use simple words. Give 2-4 items per list and 2-4 "say" phrases. This is not legal advice.`;

// 1. Speech to text (ElevenLabs Scribe)
app.post('/api/transcribe', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    const form = new FormData();
    form.append('model_id', 'scribe_v1');
    form.append('file', new Blob([req.body], { type: req.headers['content-type'] || 'audio/webm' }), 'speech.webm');
    const r = await fetch(`${EL}/speech-to-text`, { method: 'POST', headers: elKey(), body: form });
    const d = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(d));
    res.json({ text: d.text, language: d.language_code });
  } catch (e) { console.error(e); res.status(500).json({ error: String(e.message || e) }); }
});

// 2. Text Analysis & Script Generation Route (Multi-Country Aware)
app.post('/api/understand', async (req, res) => {
  try {
    const { text, language = 'en', country = 'UK', they } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const prompt = `
    You help international newcomers handle essential services in ${country}.
    Analyze this situation described by the user: "${text}"
    Target country: ${country}.
    Target user language: ${language}.
    Other person language: ${they || language}.

    ${shapeFor(language, they)}
    Provide accurate guidance tailored specifically to institutional standards and practices in ${country}.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = parseJson(response.text);
    res.json(parsed);
  } catch (err) {
    console.error('Understand error:', err);
    res.status(500).json({ error: 'Failed to analyze situation with Gemini.' });
  }
});

// 3. Photo & Document Upload OCR Route (Multi-Country Aware)
app.post('/api/document', async (req, res) => {
  try {
    const { data, mediaType, language = 'en', country = 'UK', they } = req.body;
    if (!data || !mediaType) {
      return res.status(400).json({ error: 'Base64 data and mediaType required' });
    }

    const imagePart = {
      inlineData: {
        data: data,
        mimeType: mediaType
      }
    };

    const prompt = `
    Analyze this uploaded document or photo for a newcomer in ${country}.
    Provide your explanation keeping in mind the laws and institutions of ${country}.
    Target language: ${language}.

    ${shapeFor(language, they)}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [prompt, imagePart],
      config: { responseMimeType: "application/json" }
    });

    const parsed = parseJson(response.text);
    res.json(parsed);
  } catch (err) {
    console.error('Document scan error:', err);
    res.status(500).json({ error: 'Failed to process image/document.' });
  }
});

// 4. ElevenLabs Text-to-Speech Route
app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const voice = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const r = await fetch(`${EL}/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { ...elKey(), 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
    });
    
    if (!r.ok) throw new Error(await r.text());
    res.set('content-type', 'audio/mpeg').send(Buffer.from(await r.arrayBuffer()));
  } catch (err) {
    console.error('Speech endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.listen(PORT, () => {
  console.log(`Arrival running on http://localhost:${PORT}`);
});