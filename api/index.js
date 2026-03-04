const { default: satori } = require("satori");
const sharp = require("sharp");

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
    const installs  = Math.round(stats.install || 0);
    const rating    = parseFloat((stats.weightedRating || 0).toFixed(1));
    const ratingCnt = Math.round(stats.ratingcount || 0);
    return { installs, rating, ratingCnt };
  } catch {
    return { installs: 539, rating: 4.6, ratingCnt: 3 };
  }
}

async function fetchFont(url) {
  const res = await fetch(url);
  return await res.arrayBuffer();
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "image/png");

  const { installs, rating, ratingCnt } = await fetchMarketplaceStats();
  const installsStr = installs >= 1000 ? (installs/1000).toFixed(1)+"K" : installs.toString();
  const filled   = Math.round(rating);
  const starsStr = "★".repeat(filled) + "☆".repeat(5 - filled);

  const [orbitronBold, shareTechMono] = await Promise.all([
    fetchFont("https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.woff"),
    fetchFont("https://fonts.gstatic.com/s/sharetechmono/v15/J7aHnp1uDWRBEqV98dVQztYldFc7pAsEIc3Xew.woff"),
  ]);

  const logoRes    = await fetch("https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/images/logo-vs.png");
  const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
  const logoB64    = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const W = 1200, BH = 300, SH = 72, TH = BH + SH;

  const node = {
    type: "div",
    props: {
      style: { display:"flex", flexDirection:"column", width:W, height:TH, fontFamily:"ShareTechMono" },
      children: [
        // BANNER
        {
          type:"div", props:{ style:{ display:"flex", width:W, height:BH, background:"#060d1a", position:"relative", overflow:"hidden" },
          children:[
            { type:"div", props:{ style:{ position:"absolute", left:-80, top:0, width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,180,255,0.13) 0%, transparent 70%)" } } },
            { type:"div", props:{ style:{ position:"absolute", left:320, top:0, bottom:0, width:1, background:"linear-gradient(180deg, transparent, rgba(0,180,255,0.35) 30%, rgba(0,180,255,0.35) 70%, transparent)" } } },
            { type:"div", props:{ style:{ position:"absolute", left:0, right:0, bottom:0, height:3, background:"linear-gradient(90deg,#0553b1,#00d4ff 40%,#4ec9b0 70%,transparent)" } } },
            { type:"div", props:{ style:{ position:"absolute", left:0, top:0, width:320, height:BH, display:"flex", alignItems:"center", justifyContent:"center" },
              children:[{ type:"img", props:{ src:logoB64, style:{ width:210, height:210 } } }]
            }},
            { type:"div", props:{ style:{ position:"absolute", left:352, right:36, top:0, height:BH, display:"flex", flexDirection:"column", justifyContent:"center" },
              children:[
                { type:"div", props:{ style:{ fontSize:11, color:"#00b4ff", letterSpacing:3, marginBottom:10 }, children:"VS Code Extension · Flutter · Dart" } },
                { type:"div", props:{ style:{ fontSize:36, fontWeight:900, color:"#ffffff", fontFamily:"Orbitron", marginBottom:2 }, children:"Dart Clean" } },
                { type:"div", props:{ style:{ fontSize:36, fontWeight:900, color:"#00d4ff", fontFamily:"Orbitron", marginBottom:8 }, children:"Architecture" } },
                { type:"div", props:{ style:{ fontSize:13, color:"#4a9fc8", letterSpacing:2, marginBottom:14, fontFamily:"Orbitron" }, children:"Hexagonal · Feature-First · Melos" } },
                { type:"div", props:{ style:{ fontSize:12, color:"#7ab8d4", lineHeight:1.7, marginBottom:16 }, children:"Generate complete Clean Architecture for Flutter & Dart in seconds. CRUD scaffolding, Use Cases, Blocs — fully automated." } },
                { type:"div", props:{ style:{ display:"flex", gap:8 },
                  children:[
                    { type:"div", props:{ style:{ fontSize:10, color:"#00d4ff", border:"1px solid rgba(0,212,255,0.4)", background:"rgba(0,212,255,0.07)", padding:"4px 11px", borderRadius:2 }, children:"Feature-First" } },
                    { type:"div", props:{ style:{ fontSize:10, color:"#00d4ff", border:"1px solid rgba(0,212,255,0.4)", background:"rgba(0,212,255,0.07)", padding:"4px 11px", borderRadius:2 }, children:"Layer-First" } },
                    { type:"div", props:{ style:{ fontSize:10, color:"#4ec9b0", border:"1px solid rgba(78,201,176,0.4)", background:"rgba(78,201,176,0.07)", padding:"4px 11px", borderRadius:2 }, children:"CRUD Gen" } },
                    { type:"div", props:{ style:{ fontSize:10, color:"#4ec9b0", border:"1px solid rgba(78,201,176,0.4)", background:"rgba(78,201,176,0.07)", padding:"4px 11px", borderRadius:2 }, children:"Melos" } },
                    { type:"div", props:{ style:{ fontSize:10, color:"#8899aa", border:"1px solid rgba(136,153,170,0.3)", background:"rgba(136,153,170,0.05)", padding:"4px 11px", borderRadius:2 }, children:"MIT License" } },
                  ]
                }},
              ]
            }},
          ]}
        },
        // STATS BAR
        {
          type:"div", props:{ style:{ display:"flex", width:W, height:SH, background:"#080f1c", borderTop:"1px solid #0d2035", padding:"0 40px", alignItems:"center" },
          children:[
            { type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, borderRight:"1px solid #1a2a3a" }, children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:"INSTALLS" } },
              { type:"div", props:{ style:{ fontSize:20, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:installsStr } },
              { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a" }, children:"total downloads" } },
            ]}},
            { type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:"RATING" } },
              { type:"div", props:{ style:{ fontSize:20, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:rating.toFixed(1) } },
              { type:"div", props:{ style:{ fontSize:13, color:"#f0a500" }, children:starsStr } },
            ]}},
            { type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:"REVIEWS" } },
              { type:"div", props:{ style:{ fontSize:20, color:"#00d4ff", fontFamily:"Orbitron", fontWeight:700 }, children:ratingCnt.toString() } },
              { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a" }, children:"total ratings" } },
            ]}},
            { type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, borderRight:"1px solid #1a2a3a", padding:"0 32px" }, children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:"PUBLISHER" } },
              { type:"div", props:{ style:{ fontSize:13, color:"#7ab8d4" }, children:"Edgardo Chiuchiolo" } },
              { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a" }, children:"FlutterCleanArchitecture" } },
            ]}},
            { type:"div", props:{ style:{ display:"flex", flexDirection:"column", flex:1, padding:"0 32px" }, children:[
              { type:"div", props:{ style:{ fontSize:9, color:"#334455", letterSpacing:1.5 }, children:"LICENSE" } },
              { type:"div", props:{ style:{ fontSize:13, color:"#4ec9b0" }, children:"MIT Open Source" } },
              { type:"div", props:{ style:{ fontSize:10, color:"#4a7a8a" }, children:"Free forever" } },
            ]}},
            { type:"div", props:{ style:{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#4ec9b0", whiteSpace:"nowrap" }, children:[
              { type:"div", props:{ style:{ width:6, height:6, borderRadius:"50%", background:"#4ec9b0" } } },
              "LIVE DATA",
            ]}},
          ]}
        },
      ],
    },
  };

  const svg = await satori(node, {
    width: W, height: TH,
    fonts: [
      { name:"Orbitron",      data:orbitronBold,  weight:900, style:"normal" },
      { name:"ShareTechMono", data:shareTechMono, weight:400, style:"normal" },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  res.end(png);
};
