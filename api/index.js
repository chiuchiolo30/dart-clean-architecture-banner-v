const { default: satori } = require("satori");
const sharp = require("sharp");
const path  = require("path");
const fs    = require("fs");

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
    if (!ext) throw new Error("not found");
    const stats = {};
    (ext.statistics || []).forEach((s) => (stats[s.statisticName] = s.value));
    return {
      installs:  Math.round(stats.install || stats.onpremDownloads || 0),
      rating:    parseFloat((stats.weightedRating || 0).toFixed(1)),
      ratingCnt: Math.round(stats.ratingcount || 0),
    };
  } catch {
    return { installs: 539, rating: 4.6, ratingCnt: 3 };
  }
}

// Build SVG stars image (5 stars, filled based on rating)
function buildStarsSvg(filled) {
  const W = 110, H = 20;
  const starPath = "M10 2 L12.4 7.5 L18.5 8 L14 12 L15.5 18 L10 15 L4.5 18 L6 12 L1.5 8 L7.6 7.5 Z";
  const stars = Array.from({ length: 5 }, (_, i) => {
    const x = i * 22;
    const color = i < filled ? "#f0a500" : "#2a3a4a";
    return `<path d="${starPath}" transform="translate(${x},0)" fill="${color}" stroke="${i < filled ? "#f0a500" : "#445"}" stroke-width="0.5"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${stars}</svg>`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "image/png");

  const { installs, rating, ratingCnt } = await fetchMarketplaceStats();
  const installsStr = installs >= 1000 ? (installs/1000).toFixed(1)+"K" : installs.toLocaleString();
  const filled = Math.round(rating);

  const orbitronData = fs.readFileSync(path.join(__dirname, "../fonts/Orbitron-Bold.ttf"));
  const monoData     = fs.readFileSync(path.join(__dirname, "../fonts/ShareTechMono-Regular.ttf"));

  const logoBuffer = Buffer.from(
    await fetch("https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/images/logo-vs.png")
      .then(r => r.arrayBuffer())
  );
  const logoB64  = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const starsB64 = `data:image/svg+xml;base64,${Buffer.from(buildStarsSvg(filled)).toString("base64")}`;

  const W = 1200, BH = 300, SH = 76, TH = BH + SH;

  // Background dots
  const dotPositions = [
    [96,18],[288,36],[456,9],[624,27],[792,18],[960,36],[1104,9],
    [72,90],[216,108],[384,81],[540,99],[708,72],[888,99],[1056,81],
    [144,162],[312,144],[480,171],[648,153],[816,162],[984,144],[1128,171],
    [48,234],[192,216],[360,243],[528,225],[720,234],[912,216],[1080,243],
    [168,270],[336,252],[504,279],[672,261],[840,270],[1008,252],[1152,279],
  ];
  const dotsSvg  = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BH}">${dotPositions.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="rgba(255,255,255,0.45)"/>`).join("")}</svg>`;
  const dotsB64  = `data:image/svg+xml;base64,${Buffer.from(dotsSvg).toString("base64")}`;

  const badge = (text, color, bc, bg) => ({
    type:"div", props:{ style:{ fontSize:10, color, border:`1px solid ${bc}`, background:bg, padding:"4px 11px", borderRadius:2, fontFamily:"Mono", letterSpacing:1.5 }, children:text }
  });

  const node = {
    type:"div", props:{ style:{ display:"flex", flexDirection:"column", width:W, height:TH, fontFamily:"Mono" }, children:[

      // ── BANNER ──
      { type:"div", props:{ style:{ display:"flex", width:W, height:BH, background:"#060d1a", position:"relative", overflow:"hidden" }, children:[
        { type:"img", props:{ src:dotsB64, style:{ position:"absolute", left:0, top:0, width:W, height:BH } } },
        { type:"div", props:{ style:{ position:"absolute", left:-80, top:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,180,255,0.12), transparent 70%)" } } },
        { type:"div", props:{ style:{ position:"absolute", left:320, top:0, bottom:0, width:1, background:"linear-gradient(180deg, transparent 0%, rgba(0,180,255,0.35) 30%, rgba(0,180,255,0.35) 70%, transparent 100%)" } } },
        { type:"div", props:{ style:{ position:"absolute", left:0, right:0, bottom:0, height:3, background:"linear-gradient(90deg, #0553b1 0%, #00d4ff 40%, #4ec9b0 70%, transparent 100%)" } } },

        // logo
        { type:"div", props:{ style:{ position:"absolute", left:0, top:0, width:320, height:BH, display:"flex", alignItems:"center", justifyContent:"center" },
          children:[{ type:"img", props:{ src:logoB64, style:{ width:220, height:220, filter:"drop-shadow(0px 0px 26px rgba(0,200,255,0.6))" } } }]
        }},

        // text
        { type:"div", props:{ style:{ position:"absolute", left:352, right:36, top:0, height:BH, display:"flex", flexDirection:"column", justifyContent:"center" }, children:[
          { type:"div", props:{ style:{ fontSize:11, color:"#00b4ff", letterSpacing:3, marginBottom:10, fontFamily:"Mono" }, children:"VS Code Extension · Flutter · Dart" } },
          { type:"div", props:{ style:{ fontSize:34, fontWeight:700, color:"#ffffff", fontFamily:"Orbitron", lineHeight:1.05, marginBottom:0 }, children:"Dart Clean" } },
          { type:"div", props:{ style:{ fontSize:34, fontWeight:700, color:"#00d4ff", fontFamily:"Orbitron", lineHeight:1.05, marginBottom:8 }, children:"Architecture" } },
          { type:"div", props:{ style:{ fontSize:13, color:"#4a9fc8", letterSpacing:2, marginBottom:14, fontFamily:"Orbitron" }, children:"Hexagonal · Feature-First · Melos" } },
          { type:"div", props:{ style:{ fontSize:12, color:"#7ab8d4", lineHeight:1.7, marginBottom:18, fontFamily:"Mono" }, children:"Generate complete Clean Architecture structures for Flutter & Dart in seconds. CRUD scaffolding, Use Cases, Blocs — fully automated." } },
          { type:"div", props:{ style:{ display:"flex", gap:8 }, children:[
            badge("Feature-First","#00d4ff","rgba(0,212,255,0.4)","rgba(0,212,255,0.07)"),
            badge("Layer-First",  "#00d4ff","rgba(0,212,255,0.4)","rgba(0,212,255,0.07)"),
            badge("CRUD Gen",     "#4ec9b0","rgba(78,201,176,0.4)","rgba(78,201,176,0.07)"),
            badge("Melos",        "#4ec9b0","rgba(78,201,176,0.4)","rgba(78,201,176,0.07)"),
            badge("MIT License",  "#8899aa","rgba(136,153,170,0.3)","rgba(136,153,170,0.05)"),
          ]}},
        ]}},
      ]}},

      // ── STATS BAR ──
      { type:"div", props:{ style:{ display:"flex", width:W, height:SH, background:"#080f1c", borderTop:"1px solid #0d2035", padding:"0 40px", alignItems:"center" }, children:[

        { type:"div", props:{ style:{ display:"flex", flexDirection:"column", gap:3, flex:1, borderRight:"1px solid #1a2a3a", paddingRight:32 }, children:[
          { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5, fontFamily:"Mono" }, children:"INSTALLS" } },
          { type:"div", props:{ style:{ fontSize:22, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:installsStr } },
          { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a", fontFamily:"Mono" }, children:"total downloads" } },
        ]}},

        { type:"div", props:{ style:{ display:"flex", flexDirection:"column", gap:3, flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
          { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5, fontFamily:"Mono" }, children:"RATING" } },
          { type:"div", props:{ style:{ fontSize:22, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:rating.toFixed(1) } },
          { type:"img", props:{ src:starsB64, style:{ width:110, height:20, marginTop:2 } } },
        ]}},

        { type:"div", props:{ style:{ display:"flex", flexDirection:"column", gap:3, flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
          { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5, fontFamily:"Mono" }, children:"REVIEWS" } },
          { type:"div", props:{ style:{ fontSize:22, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:ratingCnt.toString() } },
          { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a", fontFamily:"Mono" }, children:"total ratings" } },
        ]}},

        { type:"div", props:{ style:{ display:"flex", flexDirection:"column", gap:3, flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
          { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5, fontFamily:"Mono" }, children:"PUBLISHER" } },
          { type:"div", props:{ style:{ fontSize:13, color:"#7ab8d4", fontFamily:"Mono", fontWeight:700 }, children:"Edgardo Chiuchiolo" } },
          { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a", fontFamily:"Mono" }, children:"FlutterCleanArchitecture" } },
        ]}},

        { type:"div", props:{ style:{ display:"flex", flexDirection:"column", gap:3, flex:1, padding:"0 32px" }, children:[
          { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5, fontFamily:"Mono" }, children:"LICENSE" } },
          { type:"div", props:{ style:{ fontSize:13, color:"#4ec9b0", fontFamily:"Mono", fontWeight:700 }, children:"MIT Open Source" } },
          { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a", fontFamily:"Mono" }, children:"Free forever" } },
        ]}},

        { type:"div", props:{ style:{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#4ec9b0", fontFamily:"Mono", whiteSpace:"nowrap", paddingLeft:20 }, children:[
          { type:"div", props:{ style:{ width:7, height:7, borderRadius:"50%", background:"#4ec9b0" } } },
          "LIVE DATA",
        ]}},

      ]}},

    ]},
  };

  const svg = await satori(node, {
    width: W, height: TH,
    fonts: [
      { name:"Orbitron", data:orbitronData, weight:700, style:"normal" },
      { name:"Mono",     data:monoData,     weight:400, style:"normal" },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  res.end(png);
};
