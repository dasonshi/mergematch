import fs from "fs";
import readline from "readline";
import express from "express";
import OpenAI from "openai";

const PORT = process.env.PORT || 8787;
const CHAT_MODEL = "gpt-4o-mini";
const EMB_MODEL = "text-embedding-3-small";
const TOP_K = 6;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cos(a, b) {
  let dot=0, an=0, bn=0;
  for (let i=0;i<a.length;i++){ const x=a[i], y=b[i]; dot+=x*y; an+=x*x; bn+=y*y; }
  return dot/(Math.sqrt(an)*Math.sqrt(bn)+1e-8);
}

async function loadIndex(file) {
  const out = [];
  const rl = readline.createInterface({ input: fs.createReadStream(file) });
  for await (const line of rl) {
    if (!line.trim()) continue;
    out.push(JSON.parse(line));
  }
  return out;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

let INDEX = [];
(async () => {
  INDEX = await loadIndex("index.jsonl");
  console.log("Index loaded:", INDEX.length, "chunks");
})();

app.post("/ask", async (req, res) => {
  try {
    const q = String(req.body.query || "").slice(0, 2000);
    if (!q) return res.status(400).json({ error: "missing query" });

    const qemb = await openai.embeddings.create({ model: EMB_MODEL, input: q });
    const v = qemb.data[0].embedding;

    const scored = INDEX
      .map(r => ({ r, score: cos(v, r.embedding) }))
      .sort((a,b)=>b.score-a.score)
      .slice(0, TOP_K);

    const context = scored
      .map(s => `### ${s.r.title}\n${s.r.url}\n${s.r.text}`)
      .join("\n\n---\n\n");

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: "Answer strictly from the provided context. Include method, full path, required scopes, auth method(s), parameters, and a minimal working curl with placeholders. Always cite the source URLs you used from the context." },
        { role: "user", content: `Question:\n${q}\n\nContext:\n${context}` }
      ]
    });

    res.json({
      answer: completion.choices[0].message.content,
      sources: [...new Set(scored.map(s => s.r.url))],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
