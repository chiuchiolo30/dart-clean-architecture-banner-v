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
      installs:  Math.round(stats.install || 0),
      rating:    parseFloat((stats.weightedRating || 0).toFixed(1)),
      ratingCnt: Math.round(stats.ratingcount || 0),
    };
  } catch {
    return { installs: 539, rating: 4.6, ratingCnt: 3 };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "image/png");

  const { installs, rating, ratingCnt } = await fetchMarketplaceStats();
  const installsStr = installs >= 1000 ? (installs/1000).toFixed(1)+"K" : installs.toString();
  const filled   = Math.round(rating);
  const starsStr = "★".repeat(filled) + "☆".repeat(5 - filled);

  // Load fonts bundled in the repo (no external fetch needed)
  const orbitronData = fs.readFileSync(path.join(__dirname, "../fonts/Orbitron-Bold.ttf"));
  const monoData     = fs.readFileSync(path.join(__dirname, "../fonts/ShareTechMono-Regular.ttf"));

  const logoBuffer = Buffer.from(
    await fetch("https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/images/logo-vs.png")
      .then(r => r.arrayBuffer())
  );
  const logoB64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const W = 1200, BH = 300, SH = 72, TH = BH + SH;

  const badge = (text, color, borderColor, bg) => ({
    type:"div", props:{ style:{ fontSize:10, color, border:`1px solid ${borderColor}`, background:bg, padding:"4px 11px", borderRadius:2, fontFamily:"Mono" }, children:text }
  });

  const node = {
    type:"div", props:{ style:{ display:"flex", flexDirection:"column", width:W, height:TH, fontFamily:"Mono" },
    children:[
      // BANNER
      { type:"div", props:{ style:{ display:"flex", width:W, height:BH, background:"#060d1a", position:"relative", overflow:"hidden" },
        children:[
          { type:"div", props:{ style:{ position:"absolute", left:-80, top:0, width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,180,255,0.13) 0%, transparent 70%)" } } },
          { type:"div", props:{ style:{ position:"absolute", left:320, top:0, bottom:0, width:1, background:"linear-gradient(180deg,transparent,rgba(0,180,255,0.35) 30%,rgba(0,180,255,0.35) 70%,transparent)" } } },
          { type:"div", props:{ style:{ position:"absolute", left:0, right:0, bottom:0, height:3, background:"linear-gradient(90deg,#0553b1,#00d4ff 40%,#4ec9b0 70%,transparent)" } } },
          { type:"div", props:{ style:{ position:"absolute", left:0, top:0, width:320, height:BH, display:"flex", alignItems:"center", justifyContent:"center" },
            children:[{ type:"img", props:{ src:logoB64, style:{ width:210, height:210 } } }]
          }},
          { type:"div", props:{ style:{ position:"absolute", left:352, right:36, top:0, height:BH, display:"flex", flexDirection:"column", justifyContent:"center" },
            children:[
              { type:"div", props:{ style:{ fontSize:11, color:"#00b4ff", letterSpacing:3, marginBottom:10 }, children:"VS Code Extension · Flutter · Dart" } },
              { type:"div", props:{ style:{ fontSize:36, fontWeight:700, color:"#ffffff", fontFamily:"Orbitron", marginBottom:2 }, children:"Dart Clean" } },
              { type:"div", props:{ style:{ fontSize:36, fontWeight:700, color:"#00d4ff", fontFamily:"Orbitron", marginBottom:8 }, children:"Architecture" } },
              { type:"div", props:{ style:{ fontSize:13, color:"#4a9fc8", letterSpacing:2, marginBottom:14, fontFamily:"Orbitron" }, children:"Hexagonal · Feature-First · Melos" } },
              { type:"div", props:{ style:{ fontSize:12, color:"#7ab8d4", lineHeight:1.7, marginBottom:16 }, children:"Generate complete Clean Architecture for Flutter & Dart in seconds. CRUD scaffolding, Use Cases, Blocs — fully automated." } },
              { type:"div", props:{ style:{ display:"flex", gap:8 }, children:[
                badge("Feature-First","#00d4ff","rgba(0,212,255,0.4)","rgba(0,212,255,0.07)"),
                badge("Layer-First",  "#00d4ff","rgba(0,212,255,0.4)","rgba(0,212,255,0.07)"),
                badge("CRUD Gen",     "#4ec9b0","rgba(78,201,176,0.4)","rgba(78,201,176,0.07)"),
                badge("Melos",        "#4ec9b0","rgba(78,201,176,0.4)","rgba(78,201,176,0.07)"),
                badge("MIT License",  "#8899aa","rgba(136,153,170,0.3)","rgba(136,153,170,0.05)"),
              ]}},
            ]
          }},
        ]
      }},
      // STATS BAR
      { type:"div", props:{ style:{ display:"flex", width:W, height:SH, background:"#080f1c", borderTop:"1px solid #0d2035", padding:"0 40px", alignItems:"center" },
        children:[
          ...[
            { label:"INSTALLS", value:installsStr,         sub:"total downloads",        subColor:"#4a7a8a" },
            { label:"RATING",   value:rating.toFixed(1),   sub:starsStr,                  subColor:"#f0a500" },
            { label:"REVIEWS",  value:ratingCnt.toString(),sub:"total ratings",           subColor:"#4a7a8a" },
            { label:"PUBLISHER",value:"Edgardo Chiuchiolo", sub:"FlutterCleanArchitecture",subColor:"#4a7a8a", small:true },
            { label:"LICENSE",  value:"MIT Open Source",    sub:"Free forever",            subColor:"#4a7a8a", small:true, last:true },
          ].map(({ label, value, sub, subColor, small, last }, i) => ({
            type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, ...(!last?{borderRight:"1px solid #1a2a3a"}:{}), padding: i===0 ? "0 32px 0 0" : "0 32px" },
            children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:label } },
              { type:"div", props:{ style:{ fontSize:small?13:20, color:label==="LICENSE"?"#4ec9b0":"#00d4ff", fontFamily:small?"Mono":"Orbitron", fontWeight:700 }, children:value } },
              { type:"div", props:{ style:{ fontSize:10, color:subColor }, children:sub } },
            ]}
          })),
          { type:"div", props:{ style:{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#4ec9b0", whiteSpace:"nowrap", paddingLeft:20 }, children:[
            { type:"div", props:{ style:{ width:6, height:6, borderRadius:"50%", background:"#4ec9b0" } } },
            "LIVE",
          ]}},
        ]
      }},
    ]}
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
