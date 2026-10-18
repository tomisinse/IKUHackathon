# Nod and Hope

**Understand like a local.** Nod and Hope helps international newcomers handle everyday essential services in a new country: opening a bank account, registering with a doctor, renting a home, reading official letters, and more.

Describe your situation by typing or speaking, or upload a photo of a letter or form. Nod and Hope explains what is going on in your own language and gives you a short checklist and polite phrases you can show or say out loud.

> Nod and Hope gives general guidance only. It is **not** legal, medical or financial advice. For complex immigration or legal cases, use official government sources or a regulated adviser.

## Features

- **Describe your situation** by text or voice and get a plain-language summary, "do now" steps, documents to bring, and phrases to say.
- **Voice input** (speech-to-text) so you can speak instead of typing.
- **Listen to phrases** read aloud (text-to-speech), with a browser voice fallback.
- **Scan a letter or form**: upload a photo and get it explained.
- **Multi-country**: UK, Spain, France, Germany, USA, Canada, UAE and Japan.
- **Multi-language**: English, Spanish, Arabic (right-to-left supported), French, German and Chinese. Set the language you speak and the language the other person speaks.
- **Quick scenarios**: viewing a flat, banking, doctor's visit.

## APIs and services used

| Service | Used for | Where |
|---|---|---|
| **Google Gemini API** (`@google/genai`) | Understanding the user's situation, analysing uploaded photos/documents, generating guides and bilingual phrases (JSON output) | `/api/understand`, `/api/document` |
| **ElevenLabs Speech to Text** (`scribe_v1`) | Transcribing voice recordings | `/api/transcribe` |
| **ElevenLabs Text to Speech** (`eleven_multilingual_v2`) | Reading phrases aloud | `/api/speak` |
| **Browser MediaRecorder / getUserMedia** | Recording audio from the microphone | `public/app.js` |
| **Browser Web Speech API** (`speechSynthesis`) | Fallback voice if ElevenLabs is unavailable | `public/app.js` |

## Built with Claude

This project was built with the help of **Claude**, an AI assistant made by [Anthropic](https://www.anthropic.com). Claude helped with debugging, writing and fixing code, API troubleshooting, and Git/GitHub setup. The app itself calls Gemini and ElevenLabs at runtime, not Claude.

## Tech stack

- Node.js (ES modules) and Express
- Vanilla JavaScript, HTML and CSS (no front-end framework)
- `dotenv` for configuration

## Project structure

```
NodandHope/
├── server.js          # Express server and API routes
├── playbooks.json     # Local reference playbooks (UK)
├── package.json
├── package-lock.json
├── .env               # Your secret keys (NOT committed)
├── .gitignore
└── public/
    ├── index.html
    ├── app.js         # Front-end logic and rendering
    └── style.css
```

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- An [ElevenLabs](https://elevenlabs.io) API key (starts with `sk_`)

### 2. Install

```bash
git clone https://github.com/tomisinse/IKUHackathon.git
cd IKUHackathon
npm install
```

### 3. Configure

Create a file named `.env` in the project root:

```
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=sk_your_elevenlabs_key
ELEVENLABS_VOICE_ID=a_voice_id_your_account_can_use
GEMINI_MODEL=optional_model_name
PORT=3000
```

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes | From Google AI Studio |
| `ELEVENLABS_API_KEY` | Yes | Must be the secret key (`sk_...`), not the key ID |
| `ELEVENLABS_VOICE_ID` | Recommended | Free ElevenLabs accounts cannot use library voices through the API. Pick a voice your account has access to |
| `GEMINI_MODEL` | No | Overrides the default Gemini model |
| `PORT` | No | Defaults to 3000 |

**Never commit your `.env` file.** It is listed in `.gitignore`.

### 4. Run

```bash
npm start
```

Open <http://localhost:3000>.

The microphone only works on `http://localhost` or an `https://` address.

## API routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/understand` | Body: `{ text, language, country, they }`. Returns a guide as JSON |
| POST | `/api/document` | Body: `{ data (base64), mediaType, language, country, they }`. Explains an uploaded image |
| POST | `/api/transcribe` | Raw audio body. Returns `{ text, language }` |
| POST | `/api/speak` | Body: `{ text }`. Returns `audio/mpeg` |

## Troubleshooting

- **404 on an API route**: restart the server. Node does not reload code automatically.
- **500 errors**: check the terminal running the server and confirm your `.env` keys are correct.
- **"Free users cannot use library voices"**: set `ELEVENLABS_VOICE_ID` to a voice your account can use, or add credits.
- **`fetch failed` on transcription**: try a different network (phone hotspots, VPNs and some antivirus tools can interrupt uploads).

