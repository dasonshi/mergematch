// crawler.js — robust SPA docs crawler (no hardcoded subtrees)
const { chromium } = require('playwright');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const ORIGIN   = 'https://marketplace.gohighlevel.com';
const DOCS_ROOT = `${ORIGIN}/docs/`;
const OUT_DIR  = 'out-md';
const MAX_PAGES = 2000; // safety cap

const turndown = new TurndownService({ codeBlockStyle: 'fenced', headingStyle: 'atx' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ensureDir = p => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function sameDocs(u) { return typeof u === 'string' && u.startsWith(DOCS_ROOT); }
function normalize(u) { return u.replace(/#.*$/, '').replace(/\/$/, ''); }
function sanitizeFilename(str) {
  return str.replace(/^https?:\/\//,'').replace(/[^\w./-]+/g,'-').replace(/-+/g,'-').slice(0,180);
}

function pickMainContent(document) {
  const candidates = [
    'main article',
    'main .theme-doc-markdown',
    'main [class*="markdown"]',
    'article',
    'main',
    '#content'
  ];
  for (const sel of candidates) {
    const node = document.querySelector(sel);
    if (node && node.textContent.trim().length > 50) return node;
  }
  return document.body;
}

async function expandAndHarvest(page) {
  // Expand collapsibles + scroll sidebar to force virtualized items to render
  await page.evaluate(async () => {
    function clickAll(selector) {
      document.querySelectorAll(selector).forEach(el => { try { el.click(); } catch(e) {} });
    }
    // Try multiple passes; some UIs expand progressively
    for (let pass = 0; pass < 5; pass++) {
      clickAll('button[aria-expanded="false"]');
      clickAll('[data-testid*="toggle"]');
      clickAll('.menu__link--sublist');
      await new Promise(r => setTimeout(r, 120));
    }
    // Scroll sidebar and page to bottom a few times
    const scrollElem = async (el) => {
      if (!el) return;
      for (let i = 0; i < 20; i++) {
        el.scrollTop = el.scrollHeight;
        await new Promise(r => setTimeout(r, 80));
      }
    };
    await scrollElem(document.querySelector('aside'));
    for (let i = 0; i < 6; i++) {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 100));
    }
  });

  // Harvest visible anchors
  const domLinks = await page.$$eval('a', as =>
    as.map(a => a.href).filter(Boolean)
  );

  return new Set(domLinks);
}

async function discoverAllUrls(page) {
  const queue = [DOCS_ROOT]; // single seed; we discover the rest
  const seen = new Set();
  const found = new Set();

  // Network sniffer to catch JSON/JS that contains /docs/... URLs
  const networkFound = new Set();
  const DOCS_RE = new RegExp(escRe(DOCS_ROOT) + '[^"\'\\s)]+', 'g');

  page.on('response', async (resp) => {
    try {
      const ct = (resp.headers()['content-type'] || '').toLowerCase();
      if (!/json|javascript/.test(ct)) return;
      const txt = await resp.text();
      const hits = txt.match(DOCS_RE);
      if (hits) hits.forEach(h => networkFound.add(normalize(h)));
    } catch (_) {}
  });

  while (queue.length && found.size < MAX_PAGES) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await sleep(300);
      // expand + harvest DOM
      const domSet = await expandAndHarvest(page);
      await sleep(500); // give late-rendered menus time

      // Merge DOM + network-discovered links
      const merged = new Set([...domSet, ...networkFound]);
      for (const href of merged) {
        if (!sameDocs(href)) continue;
        const clean = normalize(href);
        if (!seen.has(clean) && !found.has(clean)) {
          found.add(clean);
          queue.push(clean);
        }
      }
      // small extra: pick up links present in scripts in this page’s HTML
      const html = await page.content();
      const extra = html.match(DOCS_RE);
      if (extra) {
        for (const e of extra.map(normalize)) {
          if (sameDocs(e) && !seen.has(e) && !found.has(e)) {
            found.add(e); queue.push(e);
          }
        }
      }
      console.log('Discovered so far:', found.size);
    } catch (e) {
      console.warn('Discover failed:', url, e.message);
    }
  }
  return [...found];
}

async function renderToMarkdown(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(400); // allow content to settle

  const html = await page.content();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  ['nav','header','footer','aside'].forEach(sel =>
    doc.querySelectorAll(sel).forEach(el => el.remove())
  );

  const main = pickMainContent(doc);
  main.querySelectorAll('a').forEach(a => {
    const t = (a.textContent || '').toLowerCase().trim();
    if (t.includes('edit this page') || t.includes('feedback')) a.remove();
  });

  const md = turndown.turndown(main.innerHTML);
  return `# ${url}\n\n${md}\n`;
}

(async () => {
  ensureDir(OUT_DIR);
  const compiledPath = path.join(OUT_DIR, 'ghl-api-v2-compiled.md');
  const compiled = fs.createWriteStream(compiledPath, { flags: 'w' });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Discovering URLs (DOM + network)…');
  const urls = await discoverAllUrls(page);
  const uniqueUrls = [...new Set(urls)].sort();
  console.log(`Found ${uniqueUrls.length} pages.`);

  let i = 0;
  for (const url of uniqueUrls) {
    i++;
    try {
      const md = await renderToMarkdown(page, url);
      const rel = url.replace(DOCS_ROOT, '').replace(/^\//,'') || 'index';
      const fileSlug = sanitizeFilename(`marketplace__${rel}`).replace(/\//g,'__') || 'index';
      const outFile = path.join(OUT_DIR, `${fileSlug}.md`);
      fs.writeFileSync(outFile, md, 'utf-8');
      compiled.write(`\n\n---\n\n${md}`);
      console.log(`[${i}/${uniqueUrls.length}] Saved: ${outFile}`);
    } catch (e) {
      console.warn(`Failed ${url}: ${e.message}`);
    }
  }

  compiled.end();
  await browser.close();
  console.log(`\nDone.\nPer-page Markdown in: ${OUT_DIR}\nCompiled book: ${compiledPath}`);
})();
