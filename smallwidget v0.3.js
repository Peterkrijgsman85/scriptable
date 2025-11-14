// Kleine Scriptable widget voor Shell Recharge locatie
// 📍 Gebruik als parameter: laadstation-ID (bijv. 4452657)

const stationId = args.widgetParameter ? args.widgetParameter.trim() : null;

// 🧩 Controleer of parameter is ingevuld
if (!stationId) {
  let widget = new ListWidget();
  widget.setPadding(10, 10, 10, 10); // ⭐ padding rondom 10px

  // 🌈 Achtergrondkleur met lichte gradient
  let gradient = new LinearGradient();
  gradient.colors = [new Color("#0097bb"), new Color("#ffffff")];
  gradient.locations = [0.0, 1.0];
  gradient.startPoint = new Point(0, 0);
  gradient.endPoint = new Point(1, 1);
  widget.backgroundGradient = gradient;

  let warn = widget.addText("⚠️ Voer laadstation ID in als parameter");
  warn.font = Font.boldSystemFont(12);
  warn.textColor = new Color("#1e293b");
  warn.centerAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentSmall();
  Script.complete();
  return;
}

const url = `https://ui-map.shellrecharge.com/api/map/v2/locations/${stationId}`;

try {
  let req = new Request(url);
  let json = await req.loadJSON();

  let name = json.name;
  let ev0 = json.evses[0];
  let ev1 = json.evses[1];

  let status0 = ev0.status;
  let status1 = ev1.status;

  let updated0 = ev0.updated;
  let updated1 = ev1.updated;

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

  // 🎨 Widget maken
  let widget = new ListWidget();
  widget.setPadding(10, 10, 10, 10); // ⭐ padding rondom 10px

  // 🌈 Gradient achtergrond
  let gradient = new LinearGradient();
  gradient.colors = [new Color("#0097bb"), new Color("#ffffff")];
  gradient.locations = [0.0, 1.0];
  gradient.startPoint = new Point(0, 0);
  gradient.endPoint = new Point(1, 1);
  widget.backgroundGradient = gradient;

  // 🔝 Titelbalk
  let header = widget.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  let title = header.addText(name);
  title.font = Font.semiboldSystemFont(13);
  title.textColor = new Color("#0f172a");
  title.leftAlignText();
  title.lineLimit = 3; // ⭐ maximaal 3 regels

  header.addSpacer();

  let icon = header.addText("⚡️");
  icon.font = Font.systemFont(15);
  icon.textColor = new Color("#facc15");

  widget.addSpacer(12);

  function maakStatusRij(emoji, status, updatedStr) {
    let full = widget.addStack();
    full.layoutVertically();
    full.topAlignContent();

    let stack = full.addStack();
    stack.layoutHorizontally();
    stack.centerAlignContent();

    let plug = stack.addText(emoji);
    plug.font = Font.systemFont(14);
    plug.textColor = new Color("#0f172a");

    stack.addSpacer();

    let badge = stack.addStack();
    badge.setPadding(2, 6, 2, 6);
    badge.cornerRadius = 6;
    badge.centerAlignContent();

    let kleur;
    let tekstKleur = Color.white();

    if (status === "Beschikbaar") kleur = new Color("#059669");
    else if (status === "Bezet") kleur = new Color("#dc2626");
    else kleur = new Color("#ca8a04");

    badge.backgroundColor = kleur;

    let statusText = badge.addText(status);
    statusText.font = Font.semiboldSystemFont(11);
    statusText.textColor = tekstKleur;

    let bottom = full.addStack();
    bottom.layoutHorizontally();
    bottom.addSpacer();

    let upd = bottom.addText(formatRelative(updatedStr));
    upd.font = Font.systemFont(8);
    upd.textColor = new Color("#475569");
    upd.rightAlignText();

    return full;
  }

  maakStatusRij("🔌🅿️", s0, updated0);
  widget.addSpacer(4);
  maakStatusRij("🔌", s1, updated1);

  widget.addSpacer(6);

  let now = new Date();
  let hh = now.getHours().toString().padStart(2,"0");
  let mm = now.getMinutes().toString().padStart(2,"0");
  let footer = widget.addText(`Laatste update: ${hh}:${mm}`);
  footer.font = Font.systemFont(9);
  footer.textColor = new Color("#334155");
  footer.centerAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentSmall();

  Script.complete();

} catch (e) {
  let widget = new ListWidget();
  widget.setPadding(10, 10, 10, 10);
  widget.backgroundColor = new Color("#fee2e2");

  let errorText = widget.addText("⚠️ Fout bij laden\n");
  errorText.font = Font.boldSystemFont(12);
  errorText.textColor = new Color("#991b1b");
  errorText.centerAlignText();

  let msg = widget.addText(e.toString());
  msg.font = Font.systemFont(9);
  msg.textColor = new Color("#b91c1c");
  msg.centerAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentSmall();

  Script.complete();
}
