const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const PUBLISHER = "FlutterCleanArchitecture";
const EXT_ID    = "dart-clena-architecture-hex";

async function fetchMarketplaceStats() {
  try {
    const res = await fetch(
      "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json;api-version=7.1-preview.1",
        },
        body: JSON.stringify({
          filters: [{ criteria: [{ filterType: 7, value: `${PUBLISHER}.${EXT_ID}` }] }],
          flags: 914,
        }),
      }
    );
    const data = await res.json();
    const ext  = data?.results?.[0]?.extensions?.[0];
    if (!ext) throw new Error("Extension not found");

    const stats = {};
    (ext.statistics || []).forEach((s) => (stats[s.statisticName] = s.value));

    const installs  = Math.round(stats.install || stats.onpremDownloads || 0);
    const rating    = parseFloat((stats.weightedRating || 0).toFixed(1));
    const ratingCnt = Math.round(stats.ratingcount || 0);

    return { installs, rating, ratingCnt };
  } catch {
    return { installs: 539, rating: 4.6, ratingCnt: 3 };
  }
}

function buildHTML({ installs, rating, ratingCnt }) {
  const installsStr = installs >= 1000
    ? (installs / 1000).toFixed(1) + "K"
    : installs.toLocaleString();

  const filled   = Math.round(rating);
  const starsStr = "★".repeat(filled) + "☆".repeat(5 - filled);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 1200px;
    background: transparent;
    font-family: 'Share Tech Mono', monospace;
  }

  .banner {
    width: 1200px; height: 300px;
    position: relative; overflow: hidden;
    background: #060d1a;
  }

  .stars-bg {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 8%  15%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 22% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 38%  8%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 52% 78%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 67% 30%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 83% 52%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 12% 88%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 91% 12%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 45%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 35%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 76% 70%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 58% 22%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 18%  3%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 72% 92%, rgba(255,255,255,0.4) 0%, transparent 100%);
  }
  .glow {
    position: absolute; left:-80px; top:50%; transform:translateY(-50%);
    width:480px; height:480px; border-radius:50%;
    background: radial-gradient(circle, rgba(0,180,255,0.12) 0%, rgba(0,80,200,0.06) 40%, transparent 70%);
  }
  .divider {
    position:absolute; left:320px; top:0; bottom:0; width:1px;
    background: linear-gradient(180deg, transparent, rgba(0,180,255,0.35) 30%, rgba(0,180,255,0.35) 70%, transparent);
  }
  .network {
    position:absolute; right:0; top:0; width:840px; height:300px; opacity:0.06;
  }
  .logo-zone {
    position:absolute; left:0; top:0; bottom:0; width:320px;
    display:flex; align-items:center; justify-content:center;
  }
  .logo-img {
    width:210px; height:210px;
    filter: drop-shadow(0 0 32px rgba(0,200,255,0.55)) drop-shadow(0 0 10px rgba(0,200,255,0.35));
  }
  .text-zone {
    position:absolute; left:348px; right:36px; top:0; bottom:0;
    display:flex; flex-direction:column; justify-content:center;
  }
  .tag { font-size:11px; color:#00b4ff; letter-spacing:3px; text-transform:uppercase; margin-bottom:10px; }
  .title { font-family:'Orbitron',sans-serif; font-weight:900; font-size:34px; line-height:1.05; color:#fff; margin-bottom:6px; }
  .title .accent { color:#00d4ff; }
  .subtitle { font-family:'Orbitron',sans-serif; font-weight:600; font-size:13px; color:#4a9fc8; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px; }
  .desc { font-size:12px; color:#7ab8d4; line-height:1.7; max-width:560px; margin-bottom:18px; }
  .badges { display:flex; gap:8px; flex-wrap:wrap; }
  .badge { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; padding:4px 11px; border-radius:2px; border:1px solid; }
  .b-blue  { color:#00d4ff; border-color:rgba(0,212,255,0.4);  background:rgba(0,212,255,0.07); }
  .b-green { color:#4ec9b0; border-color:rgba(78,201,176,0.4); background:rgba(78,201,176,0.07); }
  .b-gray  { color:#8899aa; border-color:rgba(136,153,170,0.3);background:rgba(136,153,170,0.05); }
  .bottom-bar { position:absolute; left:0; right:0; bottom:0; height:3px; background:linear-gradient(90deg,#0553b1,#00d4ff 40%,#4ec9b0 70%,transparent); }

  /* STATS */
  .stats {
    width:1200px; background:#080f1c;
    border-top:1px solid #0d2035;
    padding:14px 40px;
    display:flex; align-items:center; gap:0;
  }
  .stat { display:flex; flex-direction:column; gap:3px; padding:0 32px; flex:1; border-right:1px solid #1a2a3a; }
  .stat:first-child { padding-left:0; }
  .stat:last-child  { border-right:none; }
  .stat-label { font-size:9px; color:#334455; text-transform:uppercase; letter-spacing:1.5px; }
  .stat-value { font-family:'Orbitron',sans-serif; font-size:20px; color:#00d4ff; font-weight:700; }
  .stat-sub   { font-size:10px; color:#4a7a8a; }
  .stars-disp { color:#f0a500; font-size:14px; letter-spacing:2px; }
  .live { font-size:10px; color:#4ec9b0; margin-left:auto; display:flex; align-items:center; gap:6px; white-space:nowrap; }
  .dot  { width:6px; height:6px; border-radius:50%; background:#4ec9b0; display:inline-block; }
</style>
</head>
<body>

<div class="banner">
  <div class="stars-bg"></div>
  <div class="glow"></div>
  <div class="divider"></div>

  <svg class="network" viewBox="0 0 840 300" fill="none">
    <circle cx="100" cy="60"  r="4" fill="#00d4ff"/><circle cx="240" cy="30"  r="3" fill="#00d4ff"/>
    <circle cx="380" cy="80"  r="4" fill="#00d4ff"/><circle cx="500" cy="20"  r="3" fill="#00d4ff"/>
    <circle cx="620" cy="100" r="4" fill="#00d4ff"/><circle cx="740" cy="40"  r="3" fill="#00d4ff"/>
    <circle cx="820" cy="130" r="4" fill="#00d4ff"/><circle cx="60"  cy="180" r="3" fill="#00d4ff"/>
    <circle cx="200" cy="220" r="4" fill="#00d4ff"/><circle cx="330" cy="160" r="3" fill="#00d4ff"/>
    <circle cx="460" cy="240" r="4" fill="#00d4ff"/><circle cx="580" cy="180" r="3" fill="#00d4ff"/>
    <circle cx="700" cy="260" r="4" fill="#00d4ff"/><circle cx="800" cy="200" r="3" fill="#00d4ff"/>
    <circle cx="160" cy="120" r="3" fill="#00d4ff"/><circle cx="420" cy="140" r="4" fill="#00d4ff"/>
    <circle cx="660" cy="150" r="3" fill="#00d4ff"/>
    <line x1="100" y1="60"  x2="240" y2="30"  stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="240" y1="30"  x2="380" y2="80"  stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="380" y1="80"  x2="500" y2="20"  stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="500" y1="20"  x2="620" y2="100" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="620" y1="100" x2="740" y2="40"  stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="740" y1="40"  x2="820" y2="130" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="60"  y1="180" x2="200" y2="220" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="200" y1="220" x2="330" y2="160" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="330" y1="160" x2="460" y2="240" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="460" y1="240" x2="580" y2="180" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="580" y1="180" x2="700" y2="260" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="700" y1="260" x2="800" y2="200" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="100" y1="60"  x2="60"  y2="180" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="240" y1="30"  x2="160" y2="120" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="380" y1="80"  x2="330" y2="160" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="500" y1="20"  x2="420" y2="140" stroke="#00d4ff" stroke-width="0.8"/>
    <line x1="740" y1="40"  x2="660" y2="150" stroke="#00d4ff" stroke-width="0.8"/>
  </svg>

  <div class="logo-zone">
    <img class="logo-img"
      src="https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/images/logo-vs.png"
      alt="Logo">
  </div>

  <div class="text-zone">
    <div class="tag">VS Code Extension · Flutter · Dart</div>
    <div class="title">Dart Clean<br><span class="accent">Architecture</span></div>
    <div class="subtitle">Hexagonal · Feature-First · Melos</div>
    <div class="desc">Generate complete Clean Architecture structures for Flutter &amp; Dart in seconds.<br>CRUD scaffolding, Use Cases, Blocs — fully automated.</div>
    <div class="badges">
      <span class="badge b-blue">Feature-First</span>
      <span class="badge b-blue">Layer-First</span>
      <span class="badge b-green">CRUD Gen</span>
      <span class="badge b-green">Melos</span>
      <span class="badge b-gray">MIT License</span>
    </div>
  </div>

  <div class="bottom-bar"></div>
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-label">Installs</div>
    <div class="stat-value">${installsStr}</div>
    <div class="stat-sub">total downloads</div>
  </div>
  <div class="stat">
    <div class="stat-label">Rating</div>
    <div class="stat-value">${rating.toFixed(1)}</div>
    <div class="stat-sub"><span class="stars-disp">${starsStr}</span></div>
  </div>
  <div class="stat">
    <div class="stat-label">Reviews</div>
    <div class="stat-value">${ratingCnt || "—"}</div>
    <div class="stat-sub">total ratings</div>
  </div>
  <div class="stat">
    <div class="stat-label">Publisher</div>
    <div class="stat-value" style="font-size:13px;color:#7ab8d4;font-family:'Share Tech Mono',monospace">Edgardo Chiuchiolo</div>
    <div class="stat-sub">FlutterCleanArchitecture</div>
  </div>
  <div class="stat">
    <div class="stat-label">License</div>
    <div class="stat-value" style="font-size:13px;color:#4ec9b0;font-family:'Share Tech Mono',monospace">MIT Open Source</div>
    <div class="stat-sub">Free forever</div>
  </div>
  <div class="live"><span class="dot"></span> LIVE DATA</div>
</div>

</body>
</html>`;
}

module.exports = async function handler(req, res) {
  // Cache for 1 hour
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "image/png");

  const stats = await fetchMarketplaceStats();
  const html  = buildHTML(stats);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 370 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for Google Fonts
    await page.waitForTimeout(1200);

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 370 },
    });

    res.end(screenshot);
  } finally {
    if (browser) await browser.close();
  }
};
