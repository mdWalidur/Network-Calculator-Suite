// Simple Express proxy to call Google Generative Language API server-side
// Usage: set GOOGLE_API_KEY in environment or in a .env file and run `node server.js`
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.warn('Warning: GOOGLE_API_KEY not set. Set it in environment or .env file. Server will still start but requests will fail.');
}

app.use(require('cors')());
app.use(express.json());

app.post('/api/ai', async (req, res) => {
  const prompt = (req.body && req.body.prompt) ? String(req.body.prompt).trim() : '';
  if (!prompt) return res.status(400).json({ error: 'Missing prompt in request body' });
  if (!API_KEY) return res.status(500).json({ error: 'Server misconfigured: missing API key' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${API_KEY}`;
    const body = { prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 512 };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data });
    }

    let out = '';
    if (data.candidates && data.candidates.length) {
      out = data.candidates.map(c => c.output || c.content || JSON.stringify(c)).join('\n\n');
    } else if (data.output && data.output.length) {
      out = data.output.map(o => o.content || JSON.stringify(o)).join('\n\n');
    } else if (data.result && data.result.output) {
      out = data.result.output || JSON.stringify(data);
    } else {
      out = JSON.stringify(data, null, 2);
    }
    return res.json({ text: out, raw: data });
  } catch (err) {
    console.error('AI proxy error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy running on http://localhost:${PORT} — POST /api/ai { prompt }`);
});
