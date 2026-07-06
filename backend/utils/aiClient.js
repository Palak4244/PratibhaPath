// utils/aiClient.js
// Uses Groq API — completely FREE, no credit card, works well from India.
// Model: llama-3.1-8b-instant — fast, high quality, always free.
//
// GET YOUR KEY:
// 1. Go to console.groq.com
// 2. Sign up with Google/GitHub (instant)
// 3. Click "API Keys" → "Create API Key"
// 4. Copy the key — starts with "gsk_"
// 5. Add to backend/.env as: GROQ_API_KEY=gsk_your_key_here
// 6. Restart backend: Ctrl+C → npm run dev

const https = require("https");

function callGroq(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || !apiKey.startsWith("gsk_")) {
      return reject(new Error(
        "GROQ_API_KEY missing or invalid.\n" +
        "1. Go to console.groq.com → sign up free (Google/GitHub login works)\n" +
        "2. API Keys → Create API Key → copy it (starts with gsk_)\n" +
        "3. Add to backend/.env: GROQ_API_KEY=gsk_your_key_here\n" +
        "4. Restart backend: Ctrl+C → npm run dev"
      ));
    }

    const body = JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert resume coach helping job seekers optimize their resumes for ATS systems and recruiters. Be specific, reference actual content from the resume, and give actionable advice.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          if (res.statusCode === 401) {
            return reject(new Error(
              "Invalid GROQ_API_KEY. Open backend/.env, check key starts with gsk_ with no spaces, then restart the server."
            ));
          }
          if (res.statusCode === 429) {
            return reject(new Error(
              "Groq rate limit reached. Wait a minute and try again — free tier allows 30 requests/minute."
            ));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Groq API error (${res.statusCode}): ${data.slice(0, 200)}`));
          }
          const parsed = JSON.parse(data);
          const text = parsed?.choices?.[0]?.message?.content || "";
          resolve(text.trim() || "No suggestions generated. Please try again.");
        } catch (e) {
          reject(new Error("Failed to parse Groq response: " + e.message));
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Groq API request timed out. Check your internet connection."));
    });

    req.on("error", (e) => {
      reject(new Error(
        "Cannot reach Groq API: " + e.message + "\n" +
        "Check your internet connection. Groq works well from India."
      ));
    });

    req.write(body);
    req.end();
  });
}

module.exports = { callGroq };
