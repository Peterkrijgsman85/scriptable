// Kleine Scriptable widget voor Shell Recharge locatie
// 📍 Gebruik als parameter: "4452657" of "4452657 alert"

const rawParam = args.widgetParameter ? args.widgetParameter.trim() : "";
const parts = rawParam.split(" ");
const stationId = parts[0] || null;
const alertsEnabled = parts.includes("alert");

// 🔐 Opslag voor status vergelijken
const fm = FileManager.local();
const savePath = fm.joinPath(fm.documentsDirectory(), `status_${stationId}.json`);

function loadLastStatus() {
  if (!fm.fileExists(savePath)) return null;
  try {
    return JSON.parse(fm.readString(savePath));
  } catch { return null; }
}

function saveStatus(obj) {
  fm.writeString(savePath, JSON.stringify(obj));
}

// 🛎️ Meldingsfunctie
async function sendNotify(message) {
  let n = new Notification();
  n.title = "🔌 Laadpaal status gewijzigd";
  n.body = message;
  n.sound = "alert";
  await n.schedule();
}

// 🧩 Geen parameter → foutmelding
if (!stationId) {
  let widget = new ListWidget();
  widget.setPadding(15, 15, 0, 15);

  let warn = widget.addText("⚠️ Geef parameter op: ID of 'ID alert'");
  warn.font = Font.boldSystemFont(12);
  warn.centerAlignText();

  Script.setWidget(widget);
  Script.complete();
  return;
}

// 🌍 API request
const url = `https://ui-map.shellrecharge.com/api/map/v2/locations/${stationId}`;

try {
  let req = new Request(url);
  let json = await req.loadJSON();

  let name = json.address.streetAndNumber || "Onbekende locatie";
  let ev0 = json.evses[0];
  let ev1 = json.evses[1];

  let status0 = ev0.status;
  let status1 = ev1.status;
  let updated0 = ev0.updated;
  let updated1 = ev1.updated;

  // 🔁 Status vertaling
  function vertaalStatus(status) {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return "Beschikbaar";
      case "OCCUPIED": return "Bezet";
      case "OUTOFORDER": return "Defect";
      default: return "Onbekend";
    }
  }

  let s0 = vertaalStatus(status0);
  let s1 = vertaalStatus(status1);

  // 🕒 Datum formatter
  function formatRelative(dateStr) {
    let d = new Date(dateStr);
    let now = new Date();
    let diff = now - d;
    let oneDay = 24 * 60 * 60 * 1000;

    let hours = d.getHours().toString().padStart(2,"0");
    let minutes = d.getMinutes().toString().padStart(2,"0");

    if (diff < oneDay && d.getDate() === now.getDate()) return `Vandaag ${hours}:${minutes}`;
    else if (diff < 2 * oneDay && (new Date(now - oneDay)).getDate() === d.getDate()) return `Gisteren ${hours}:${minutes}`;
    else return `${d.getDate().toString().padStart(2,"0")}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getFullYear()} ${hours}:${minutes}`;
  }

  // 📌 👉 STATUS VERANDERING CHECK
  let last = loadLastStatus();
  let current = { s0, s1 };

  if (alertsEnabled && last && (last.s0 !== s0 || last.s1 !== s1)) {
    let diffMsg = `Plug 1: ${last.s0} → ${s0}\nPlug 2: ${last.s1} → ${s1}`;
    await sendNotify(diffMsg);
  }

  // 🔒 Bewaar nieuwe status
  saveStatus(current);


  // 🎨 Widget bouwt zoals eerder
  let widget = new ListWidget();
  widget.setPadding(15, 15, 0, 15);

  let gradient = new LinearGradient();
  gradient.colors = [new Color("#0097bb"), new Color("#ffffff")];
  gradient.locations = [0.0, 1.0];
  gradient.startPoint = new Point(0, 0);
  gradient.endPoint = new Point(1, 1);
  widget.backgroundGradient = gradient;

  // Titel
  let header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  let title = header.addText(name);
  title.font = Font.semiboldSystemFont(13);
  title.textColor = new Color("#0f172a");
  title.lineLimit = 3;

  header.addSpacer();

  let icon = header.addText("⚡️");
  icon.font = Font.systemFont(15);

  widget.addSpacer(12);

  // Rij functie
  function maakStatusRij(emoji, status, updatedStr) {
    let full = widget.addStack();
    full.layoutVertically();

    let stack = full.addStack();
    stack.layoutHorizontally();

    let plug = stack.addText(emoji);
    plug.font = Font.systemFont(14);

    stack.addSpacer();

    let badge = stack.addStack();
    badge.setPadding(2, 6, 2, 6);
    badge.cornerRadius = 6;

    let kleur;
    if (status === "Beschikbaar") kleur = new Color("#059669");
    else if (status === "Bezet") kleur = new Color("#dc2626");
    else kleur = new Color("#ca8a04");
    badge.backgroundColor = kleur;

    let t = badge.addText(status);
    t.font = Font.semiboldSystemFont(11);
    t.textColor = Color.white();

    let bottom = full.addStack();
    bottom.addSpacer();

    let upd = bottom.addText(formatRelative(updatedStr));
    upd.font = Font.systemFont(8);
    upd.textColor = new Color("#475569");

    return full;
  }

  maakStatusRij("🔌🅿️", s0, updated0);
  widget.addSpacer(4);
  maakStatusRij("🔌", s1, updated1);

  widget.addSpacer(6);

  // Footer tijd
  let now = new Date();
  let footer = widget.addText(`Laatste update: ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`);
  footer.font = Font.systemFont(9);
  footer.textColor = new Color("#334155");
  footer.centerAlignText();

  Script.setWidget(widget);
  Script.complete();

} catch (e) {
  let widget = new ListWidget();
  widget.setPadding(15, 15, 0, 15);
  widget.backgroundColor = new Color("#fee2e2");

  let errorText = widget.addText("⚠️ Fout bij laden");
  errorText.font = Font.boldSystemFont(12);
  errorText.textColor = new Color("#991b1b");

  let msg = widget.addText(e.toString());
  msg.font = Font.systemFont(9);
  msg.textColor = new Color("#b91c1c");

  Script.setWidget(widget);
  Script.complete();
}
