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

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "image/png");

  const { installs, rating, ratingCnt } = await fetchMarketplaceStats();
  const installsStr = installs >= 1000 ? (installs/1000).toFixed(1)+"K" : installs.toLocaleString();
  const filled   = Math.round(rating);
  const starsStr = "★".repeat(filled) + "☆".repeat(5 - filled);

  // Fonts bundled in repo
  const orbitronData = fs.readFileSync(path.join(__dirname, "../fonts/Orbitron-Bold.ttf"));
  const monoData     = fs.readFileSync(path.join(__dirname, "../fonts/ShareTechMono-Regular.ttf"));

  // Logo from GitHub raw
  const logoBuffer = Buffer.from(
    await fetch("https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/images/logo-vs.png")
      .then(r => r.arrayBuffer())
  );
  const logoB64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  // Canvas: 1200 wide, 300 banner + 72 stats bar
  const W = 1200, BH = 300, SH = 76, TH = BH + SH;

  // helper: badge
  const badge = (text, color, bc, bg) => ({
    type: "div",
    props: {
      style: {
        fontSize: 10, color, border: `1px solid ${bc}`, background: bg,
        padding: "4px 11px", borderRadius: 2, fontFamily: "Mono",
        letterSpacing: 1.5,
      },
      children: text,
    },
  });

  // helper: stat column
  const statCol = ({ label, value, sub, subColor = "#4a7a8a", valueColor = "#00d4ff", valueSize = 20, valueFam = "Orbitron", last = false }) => ({
    type: "div",
    props: {
      style: {
        display: "flex", flexDirection: "column", gap: 3, flex: 1,
        ...(!last ? { borderRight: "1px solid #1a2a3a" } : {}),
        padding: "0 32px",
      },
      children: [
        { type: "div", props: { style: { fontSize: 9, color: "#334455", letterSpacing: 1.5, fontFamily: "Mono", textTransform: "uppercase" }, children: label } },
        { type: "div", props: { style: { fontSize: valueSize, color: valueColor, fontFamily: valueFam, fontWeight: 700, lineHeight: 1.2 }, children: value } },
        { type: "div", props: { style: { fontSize: sub.includes("★") || sub.includes("☆") ? 14 : 10, color: subColor, fontFamily: "Mono", letterSpacing: sub.includes("★") ? 2 : 0 }, children: sub } },
      ],
    },
  });

  const node = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", width: W, height: TH, fontFamily: "Mono" },
      children: [

        // ── BANNER ──
        {
          type: "div",
          props: {
            style: { display: "flex", width: W, height: BH, background: "#060d1a", position: "relative", overflow: "hidden" },
            children: [

              // star field (simulated with radial gradients)
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", inset: 0,
                    backgroundImage: [
                      "radial-gradient(1px 1px at 8% 15%, rgba(255,255,255,0.7) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 22% 60%, rgba(255,255,255,0.5) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 38% 8%, rgba(255,255,255,0.6) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 52% 78%, rgba(255,255,255,0.4) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 67% 30%, rgba(255,255,255,0.7) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 83% 52%, rgba(255,255,255,0.5) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 12% 88%, rgba(255,255,255,0.4) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 91% 12%, rgba(255,255,255,0.6) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 45% 45%, rgba(255,255,255,0.3) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 58% 22%, rgba(255,255,255,0.7) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 72% 92%, rgba(255,255,255,0.4) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 30% 35%, rgba(255,255,255,0.5) 0%, transparent 100%)",
                      "radial-gradient(1px 1px at 76% 70%, rgba(255,255,255,0.6) 0%, transparent 100%)",
                    ].join(", "),
                  },
                },
              },

              // left glow
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", left: -80, top: 0, width: 500, height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,180,255,0.12) 0%, rgba(0,80,200,0.07) 40%, transparent 70%)",
                  },
                },
              },

              // divider line
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", left: 320, top: 0, bottom: 0, width: 1,
                    background: "linear-gradient(180deg, transparent, rgba(0,180,255,0.35) 30%, rgba(0,180,255,0.35) 70%, transparent)",
                  },
                },
              },

              // bottom accent bar
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", left: 0, right: 0, bottom: 0, height: 3,
                    background: "linear-gradient(90deg, #0553b1, #00d4ff 40%, #4ec9b0 70%, transparent)",
                  },
                },
              },

              // logo
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", left: 0, top: 0, width: 320, height: BH,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  },
                  children: [{
                    type: "img",
                    props: {
                      src: logoB64,
                      style: {
                        width: 210, height: 210,
                        // simulate the CSS drop-shadow glow
                        filter: "drop-shadow(0px 0px 28px rgba(0,200,255,0.6))",
                      },
                    },
                  }],
                },
              },

              // text zone
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute", left: 352, right: 36, top: 0, height: BH,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                  },
                  children: [
                    // tagline
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 11, color: "#00b4ff", letterSpacing: 3, marginBottom: 10, fontFamily: "Mono", textTransform: "uppercase" },
                        children: "VS Code Extension · Flutter · Dart",
                      },
                    },
                    // title line 1
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 34, fontWeight: 900, color: "#ffffff", fontFamily: "Orbitron", lineHeight: 1.05, marginBottom: 0 },
                        children: "Dart Clean",
                      },
                    },
                    // title line 2 accent
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 34, fontWeight: 900, color: "#00d4ff", fontFamily: "Orbitron", lineHeight: 1.05, marginBottom: 8 },
                        children: "Architecture",
                      },
                    },
                    // subtitle
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 13, color: "#4a9fc8", letterSpacing: 2, marginBottom: 14, fontFamily: "Orbitron", textTransform: "uppercase" },
                        children: "Hexagonal · Feature-First · Melos",
                      },
                    },
                    // description
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 12, color: "#7ab8d4", lineHeight: 1.7, marginBottom: 18, fontFamily: "Mono" },
                        children: "Generate complete Clean Architecture structures for Flutter & Dart in seconds. CRUD scaffolding, Use Cases, Blocs — fully automated.",
                      },
                    },
                    // badges row
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", gap: 8 },
                        children: [
                          badge("Feature-First", "#00d4ff", "rgba(0,212,255,0.4)",   "rgba(0,212,255,0.07)"),
                          badge("Layer-First",   "#00d4ff", "rgba(0,212,255,0.4)",   "rgba(0,212,255,0.07)"),
                          badge("CRUD Gen",      "#4ec9b0", "rgba(78,201,176,0.4)",  "rgba(78,201,176,0.07)"),
                          badge("Melos",         "#4ec9b0", "rgba(78,201,176,0.4)",  "rgba(78,201,176,0.07)"),
                          badge("MIT License",   "#8899aa", "rgba(136,153,170,0.3)", "rgba(136,153,170,0.05)"),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ── STATS BAR ──
        {
          type: "div",
          props: {
            style: {
              display: "flex", width: W, height: SH,
              background: "#080f1c",
              borderTop: "1px solid #0d2035",
              padding: "0 40px",
              alignItems: "center",
            },
            children: [
              { ...statCol({ label: "Installs", value: installsStr,         sub: "total downloads",         valueFam: "Orbitron" }), props: { ...statCol({ label:"Installs", value:installsStr, sub:"total downloads" }).props, style: { ...statCol({ label:"Installs", value:installsStr, sub:"total downloads" }).props.style, paddingLeft: 0 } } },
              statCol({ label: "Rating",   value: rating.toFixed(1),   sub: starsStr,                  subColor: "#f0a500", valueFam: "Orbitron" }),
              statCol({ label: "Reviews",  value: ratingCnt.toString(), sub: "total ratings",           valueFam: "Orbitron" }),
              statCol({ label: "Publisher",value: "Edgardo Chiuchiolo", sub: "FlutterCleanArchitecture", valueColor: "#7ab8d4", valueSize: 13, valueFam: "Mono" }),
              statCol({ label: "License",  value: "MIT Open Source",    sub: "Free forever",            valueColor: "#4ec9b0", valueSize: 13, valueFam: "Mono", last: true }),
              // live dot
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#4ec9b0", fontFamily: "Mono", whiteSpace: "nowrap", paddingLeft: 24 },
                  children: [
                    { type: "div", props: { style: { width: 6, height: 6, borderRadius: "50%", background: "#4ec9b0" } } },
                    "LIVE DATA",
                  ],
                },
              },
            ],
          },
        },

      ],
    },
  };

  const svg = await satori(node, {
    width: W, height: TH,
    fonts: [
      { name: "Orbitron", data: orbitronData, weight: 700, style: "normal" },
      { name: "Mono",     data: monoData,     weight: 400, style: "normal" },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  res.end(png);
};
