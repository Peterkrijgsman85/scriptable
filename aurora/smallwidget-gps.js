// Scriptable – Aurora & Weather "Chance of View" (Vaste Badge Kleur)
// Berekent de kans op basis van KP, Ovation, Wolken en Daglicht

let locationName = "ZOEKEN...";
let LAT, LON;
let gpsError = false;

// --- 1. GPS & LOCATIE ---
try {
  const gps = await Location.current();
  LAT = gps.latitude;
  LON = gps.longitude;
  const geo = await Location.reverseGeocode(LAT, LON);
  locationName = (geo[0]?.locality || geo[0]?.name || "LOCATIE").toUpperCase();
} catch (e) {
  gpsError = true;
  locationName = "LOCATIE NIET GEVONDEN";
}

// APIs
const KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json?c=" + Date.now();
const OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=cloud_cover,is_day&timezone=auto`;

const THEME = {
  bg:       new Color("#0b1020"),
  badgeBg:  new Color("#27d8b9", 0.15),
  badgeTx:  new Color("#27d8b9"),
  sub:      new Color("#cbd5e1"),
  line:     new Color("#22c1a6", 1.0),
  fill:     new Color("#22c1a6", 0.15),
  grid:     new Color("#ffffff", 0.3), 
  auroraRed: new Color("#ff3b3b", 0.12), 
  aurora1:   new Color("#2ee6a6", 0.10),
  warning:   new Color("#f1c40f") // Alleen voor de statustekst
};

await main();

async function main() {
  const w = new ListWidget();
  w.backgroundColor = THEME.bg;
  w.setPadding(12, 10, 10, 10);

  if (gpsError) {
    w.addText("Fout: Geen GPS.");
    Script.setWidget(w);
    return;
  }

  const [kpSeries, ovationObj, weatherObj] = await Promise.all([
    fetchLastNPoints(10), 
    fetchJson(OVATION_URL),
    fetchJson(WEATHER_URL)
  ]);

  if (!kpSeries) { w.addText("Data error."); Script.setWidget(w); return; }

  // --- BEREKENING KANS OP ZICHT ---
  const rawProb = nearestOvationProb(ovationObj?.coordinates, LAT, LON);
  const cloudCover = weatherObj?.current?.cloud_cover ?? 0;
  const isDay = weatherObj?.current?.is_day ?? 0;

  // Formule: Kans = Magnetische kans * (Gedeelte onbewolkt)
  // Als het dag is, is de kans altijd 0.
  let chanceOfView = rawProb * ((100 - cloudCover) / 100);
  if (isDay === 1) chanceOfView = 0;

  const lastPoint = kpSeries[kpSeries.length - 1];
  w.backgroundImage = await drawPlot(kpSeries);

  // --- HEADER ---
  const topRow = w.addStack();
  topRow.centerAlignContent();

  const badge = topRow.addStack();
  badge.backgroundColor = THEME.badgeBg;
  badge.cornerRadius = 6;
  badge.setPadding(3, 6, 3, 6);
  
  const pctTxt = badge.addText(`${Math.round(chanceOfView)}%`);
  pctTxt.font = Font.boldSystemFont(15);
  pctTxt.textColor = THEME.badgeTx; // Altijd de standaard thema kleur

  topRow.addSpacer(8);
  const titleStack = topRow.addStack();
  titleStack.layoutVertically();
  
  const t1 = titleStack.addText(locationName);
  t1.font = Font.boldSystemFont(11); 
  t1.textColor = THEME.sub;
  
  // Dynamische status tekst onder de stadsnaam (kleurt wel mee ter info)
  let statusText = "NOORDERLICHT";
  if (isDay === 1) statusText = "DAGLICHT";
  else if (cloudCover > 70) statusText = `BEWOLKT (${cloudCover}%)`;
  
  const t2 = titleStack.addText(statusText);
  t2.font = Font.systemFont(10); 
  t2.textColor = (isDay === 0 && cloudCover <= 70) ? THEME.sub : THEME.warning;
  t2.textOpacity = 0.7;

  w.addSpacer();

  // --- FOOTER ---
  const timeStr = lastPoint.t.toLocaleTimeString("nl-NL", {hour:"2-digit", minute:"2-digit"});
  const bottomRow = w.addStack();
  bottomRow.addSpacer();
  const ts = bottomRow.addText(`KP ${lastPoint.kp.toFixed(2)} • WOLK: ${cloudCover}% • ${timeStr}`);
  ts.font = Font.systemFont(8); ts.textColor = THEME.sub; ts.textOpacity = 0.4;
  bottomRow.addSpacer();

  Script.setWidget(w);
  w.presentSmall();
  Script.complete();
}

// ... (fetchLastNPoints, drawPlot, fetchJson, nearestOvationProb functies blijven gelijk aan vorig script)

async function fetchLastNPoints(n) {
  const data = await fetchJson(KP_URL);
  if (!data || !Array.isArray(data)) return [];
  let points = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    const kp = parseFloat(row[1]);
    if (row[1] !== null && !isNaN(kp)) {
      points.push({ t: new Date(row[0].replace(" ", "T") + "Z"), kp: kp });
    }
    if (points.length === n) break;
  }
  return points.reverse();
}

async function drawPlot(series) {
  const W = 600, H = 300;
  const GRAPH_TOP = 190, GRAPH_BTM = 275;
  const dc = new DrawContext();
  dc.size = new Size(W,H);
  dc.opaque = false;
  dc.setFillColor(THEME.bg);
  dc.fillRect(new Rect(0,0,W,H));
  dc.setFillColor(THEME.auroraRed);
  dc.fillEllipse(new Rect(-100, -50, W+200, 150));
  dc.setFillColor(THEME.aurora1);
  dc.fillEllipse(new Rect(100, 40, W-200, 120));

  const getX = (i) => (i / (series.length - 1)) * (W - 80) + 40;
  const getY = (kp) => GRAPH_BTM - (kp / 9) * (GRAPH_BTM - GRAPH_TOP);

  dc.setLineWidth(2);
  dc.setStrokeColor(THEME.grid);
  const y6 = getY(6);
  const p6 = new Path();
  for (let x = 0; x < W; x += 24) {
    p6.move(new Point(x, y6));
    p6.addLine(new Point(x + 12, y6));
  }
  dc.addPath(p6);
  dc.strokePath();

  const lp = new Path();
  const ap = new Path();
  ap.move(new Point(getX(0), GRAPH_BTM));
  series.forEach((p, i) => {
    const x = getX(i); const y = getY(p.kp);
    if (i === 0) lp.move(new Point(x, y)); else lp.addLine(new Point(x, y));
    ap.addLine(new Point(x, y));
  });
  ap.addLine(new Point(getX(series.length - 1), GRAPH_BTM));
  ap.closeSubpath();
  dc.setFillColor(THEME.fill); dc.addPath(ap); dc.fillPath();
  dc.setStrokeColor(THEME.line); dc.setLineWidth(6); dc.addPath(lp); dc.strokePath();

  return dc.getImage();
}

async function fetchJson(u) {
  const r = new Request(u);
  r.timeoutInterval = 10;
  try { return await r.loadJSON(); } catch(e) { return null; }
}

function nearestOvationProb(coords, lat, lon) {
  if (!coords || !Array.isArray(coords)) return 0;
  let b=0, m=999;
  for (const c of coords) {
    const d = Math.hypot(c[1]-lat, c[0]-lon);
    if(d<m) { m=d; b=c[2]; }
  }
  return b;
}
