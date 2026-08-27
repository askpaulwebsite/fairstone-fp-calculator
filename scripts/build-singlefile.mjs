// Stitch the dist-singlefile build into one self-contained HTML file.
// Inlines the JS bundle, the CSS, the favicon, and the Google Fonts
// (latin + latin-ext woff2 subsets as data: URIs) so the file also works offline.
// Output: fairstone-fp-calculator.html in the repo root.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const DIST = new URL('../dist-singlefile/', import.meta.url);
const OUT = new URL('../fairstone-fp-calculator.html', import.meta.url);

let html = readFileSync(new URL('index.html', DIST), 'utf8');
const assets = readdirSync(new URL('assets/', DIST));

const jsFile = assets.find((f) => f.endsWith('.js'));
const cssFile = assets.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error(`bundle not found: ${assets.join(', ')}`);

// 1. Inline the JS bundle. Escape "</script" so the parser can't end the tag early.
const js = readFileSync(new URL(`assets/${jsFile}`, DIST), 'utf8')
  .replace(/<\/script/gi, '<\\/script');
html = html.replace(
  new RegExp(`<script[^>]*src="\\./assets/${jsFile.replace(/[.[\]]/g, '\\$&')}"[^>]*></script>`),
  () => `<script type="module">${js}</script>`,
);
if (html.includes(`assets/${jsFile}`)) throw new Error('JS tag not replaced');

// 2. Inline the CSS.
const css = readFileSync(new URL(`assets/${cssFile}`, DIST), 'utf8');
html = html.replace(
  new RegExp(`<link[^>]*href="\\./assets/${cssFile.replace(/[.[\]]/g, '\\$&')}"[^>]*>`),
  () => `<style>${css}</style>`,
);
if (html.includes(`assets/${cssFile}`)) throw new Error('CSS link not replaced');

// 3. Inline the favicon (public/ files are copied, not inlined, by Vite).
const svg = readFileSync(new URL('Logo_FairstoneIreland_White.svg', DIST));
html = html.replace(
  /<link rel="icon"[^>]*>/,
  `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${svg.toString('base64')}" />`,
);

// 4. Inline Google Fonts: fetch the css2 stylesheet with a modern UA (to be
// served woff2), keep only the latin/latin-ext @font-face blocks, and embed
// each font file as a data: URI.
const cssUrlMatch = html.match(/<link\s+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"\s+rel="stylesheet"\s*\/>/);
if (cssUrlMatch) {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
  const fontCss = await (await fetch(cssUrlMatch[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': ua } })).text();
  // Blocks arrive as "/* subset */\n@font-face {...}" pairs.
  const blocks = fontCss.match(/\/\* [\w-]+ \*\/\s*@font-face\s*\{[^}]*\}/g) ?? [];
  const kept = blocks.filter((b) => /^\/\* latin(-ext)? \*\//.test(b));
  const inlined = [];
  for (const block of kept) {
    const url = block.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    inlined.push(block.replace(url, `data:font/woff2;base64,${buf.toString('base64')}`));
  }
  if (!inlined.length) throw new Error('no Google Font faces inlined');
  html = html
    .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
    .replace(cssUrlMatch[0], `<style>\n${inlined.join('\n')}\n</style>`);
}

writeFileSync(OUT, html);
console.log(`wrote ${OUT.pathname} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
