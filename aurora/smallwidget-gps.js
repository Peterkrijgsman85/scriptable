// Scriptable – Aurora & Weather "NL/BE Real-Time Edition"
let locationName = "ZOEKEN...";
let LAT, LON;
let gpsError = false;

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

const KP_URL = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";
const OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=cloud_cover,is_day&timezone=auto`;

const THEME = {
  bg:       new Color("#0b1020"),
  badgeBg:  new Color("#27d8b9", 0.15),
  badgeTx:  new Color("#27d8b9"),
  sub:      new Color("#cbd5e1"),
  line:     new Color("#22c1a6", 1.0),
  fill:     new Color("#22c1a6", 0.15),
  grid:     new Color("#ffffff", 0.8), 
  auroraRed: new Color("#ff3b3b", 0.12), 
  aurora1:   new Color("#2ee6a6", 0.10),
  warning:   new Color("#f1c40f")
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
    fetchLastNPoints(144, 10), 
    fetchJson(OVATION_URL),
    fetchJson(WEATHER_URL)
  ]);

  if (!kpSeries || kpSeries.length === 0) { 
    w.addText("Data error."); 
    Script.setWidget(w); 
    return; 
  }

  const lastPoint = kpSeries[kpSeries.length - 1];
  const currentKP = lastPoint.kp;
  const rawProb = nearestOvationProb(ovationObj?.coordinates, LAT, LON);
  const cloudCover = weatherObj?.current?.cloud_cover ?? 0;
  const isDay = weatherObj?.current?.is_day ?? 0;

  // NL/BE KANS BEREKENING
  let kpFactor = Math.min(100, (currentKP / 7) * 100); 
  let combinedProb = (rawProb * 0.7) + (kpFactor * 0.3);
  let nlWeight = currentKP < 4.0 ? 0.05 : (currentKP < 5.5 ? 0.4 : 1.0);
  let chanceOfView = (combinedProb * nlWeight) * ((100 - cloudCover) / 100);
  if (isDay === 1) chanceOfView = 0;

  // Teken de grafiek
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
  pctTxt.textColor = THEME.badgeTx;

  topRow.addSpacer(8);
  const titleStack = topRow.addStack();
  titleStack.layoutVertically();
  
  const t1 = titleStack.addText(locationName);
  t1.font = Font.boldSystemFont(11); 
  t1.textColor = THEME.sub;
  
  let statusText = isDay === 1 ? "DAGLICHT" : (cloudCover > 70 ? `BEWOLKT (${cloudCover}%)` : "NOORDERLICHT KANS");
  const t2 = titleStack.addText(statusText);
  t2.font = Font.systemFont(10); 
  t2.textColor = (isDay === 0 && cloudCover <= 70) ? THEME.sub : THEME.warning;
  t2.textOpacity = 0.7;

  // NL TIJD CORRECTIE
  const timeStr = lastPoint.t.toLocaleTimeString("nl-NL", {hour:"2-digit", minute:"2-digit"});
  const t3 = titleStack.addText(`KP ${currentKP.toFixed(2)} • ${timeStr}`);
  t3.font = Font.boldSystemFont(10); 
  t3.textColor = THEME.sub;
  t3.textOpacity = 0.9;

  w.addSpacer();

  // --- FOOTER ---
  const bottomRow = w.addStack();
  bottomRow.addSpacer();
  const footerTxt = bottomRow.addText("AFGELOPEN 24 UUR");
  footerTxt.font = Font.boldSystemFont(10); 
  footerTxt.textColor = THEME.sub;
  footerTxt.textOpacity = 0.6;
  bottomRow.addSpacer();

  Script.setWidget(w);
  w.presentSmall();
  Script.complete();
}

async function fetchLastNPoints(n, step = 1) {
  const data = await fetchJson(KP_URL);
  if (!data || !Array.isArray(data)) return [];
  let points = [];
  for (let i = data.length - 1; i >= 0; i -= step) {
    const item = data[i];
    const kp = parseFloat(item.kp_index);
    if (item.kp_index !== null && !isNaN(kp)) {
      // De 'Z' in de string zorgt ervoor dat Date() begrijpt dat het UTC is
      points.push({ t: new Date(item.time_tag + "Z"), kp: kp });
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

  // 1. Achtergrond & Aurora Gloed
  dc.setFillColor(THEME.bg);
  dc.fillRect(new Rect(0,0,W,H));
  dc.setFillColor(THEME.auroraRed);
  dc.fillEllipse(new Rect(-100, -50, W+200, 150));
  dc.setFillColor(THEME.aurora1);
  dc.fillEllipse(new Rect(100, 40, W-200, 120));

  const getX = (i) => (i / (series.length - 1)) * (W - 80) + 40;
  const getY = (kp) => GRAPH_BTM - (kp / 9) * (GRAPH_BTM - GRAPH_TOP);

  // 2. Hulplijn KP 6
  dc.setLineWidth(3);
  dc.setStrokeColor(THEME.grid);
  const yTarget = getY(6); 
  const pTarget = new Path();
  for (let x = 40; x < W - 40; x += 30) {
    pTarget.move(new Point(x, yTarget));
    pTarget.addLine(new Point(x + 15, yTarget));
  }
  dc.addPath(pTarget);
  dc.strokePath();

  // 3. De Grafiek Lijn & Vulling
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

  // 4. KP 6 LABEL (Als laatste tekenen zodat het bovenop alles ligt)
  dc.setTextColor(THEME.grid);
  dc.setFont(Font.boldSystemFont(28));
  // Teken label rechtsboven de lijn
  dc.drawText("KP 6", new Point(W - 120, yTarget - 40));

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
