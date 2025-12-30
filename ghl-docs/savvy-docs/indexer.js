import fs from "fs";
import path from "path";
import OpenAI from "openai";

const SRC_DIR = "out-md";              // where your .md files live
const OUT = "index.jsonl";
const EMB_MODEL = "text-embedding-3-small";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunk(text, size = 1800, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

async function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".md"));
  const w = fs.createWriteStream(OUT, { flags: "w" });

  for (const f of files) {
    const p = path.join(SRC_DIR, f);
    const raw = fs.readFileSync(p, "utf-8");
    const lines = raw.split(/\r?\n/);
    const title = (lines[0] || "").replace(/^#\s*/, "");
    const url = (lines[1] || "").replace(/^#\s*/, "");
    const body = lines.slice(2).join("\n");
    const pieces = chunk(body);

    for (let i = 0; i < pieces.length; i++) {
      const input = `${title}\n${url}\n${pieces[i]}`;
      const emb = await openai.embeddings.create({
        model: EMB_MODEL,
        input
      });
      const rec = {
        id: `${f}:${i}`,
        title, url,
        text: input,
        embedding: emb.data[0].embedding
      };
      w.write(JSON.stringify(rec) + "\n");
    }
    console.log("Indexed:", f);
  }

  w.end();
  console.log("Wrote", OUT);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
