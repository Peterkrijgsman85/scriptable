// 🔒 Lock Screen widget – Shell Recharge
// Gebruik als parameter: laadstation-ID (bijv. 4452657)
// 📍 Voorbeeld-API: https://ui-map.shellrecharge.com/api/map/v2/locations/4452657

// 🧩 Station-ID ophalen uit parameter
const stationId = args.widgetParameter ? args.widgetParameter.trim() : null;

// 🟡 Geen parameter ingevuld → melding tonen
if (!stationId) {
  let widget = new ListWidget();
  widget.setPadding(6, 8, 6, 8);
  widget.backgroundColor = new Color("#111827");

  let warn = widget.addText("⚠️ Voer laadstation ID in als parameter");
  warn.font = Font.semiboldSystemFont(10);
  warn.textColor = Color.white();
  warn.centerAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentAccessoryRectangular();

  Script.complete();
  return;
}

const url = `https://ui-map.shellrecharge.com/api/map/v2/locations/${stationId}`;

try {
  // 🟢 Data ophalen
  let req = new Request(url);
  let json = await req.loadJSON();

  // 🔍 Data uitlezen
  let name = json.name;
  let status0 = json.evses[0].status;
  let status1 = json.evses[1].status;

  // 🔠 Vertaal status naar tekst
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

  // 🧩 Widget maken
  let widget = new ListWidget();
  widget.setPadding(8, 10, 8, 10);
  widget.backgroundColor = new Color("#111827");

  // 🔝 Naam
  let title = widget.addText(name);
  title.font = Font.semiboldSystemFont(13);
  title.textColor = Color.white();
  title.leftAlignText();

  widget.addSpacer(2);

  // ⚡️ Vetgedrukte statussen
  let statusLine = widget.addText(`${s0} / ${s1}`);
  statusLine.font = Font.boldSystemFont(12);
  statusLine.textColor = new Color("#e5e7eb");
  statusLine.leftAlignText();

  widget.addSpacer(2);

  // 🕒 Kleine update-tijd onderaan
  let now = new Date();
  let hh = now.getHours().toString().padStart(2, "0");
  let mm = now.getMinutes().toString().padStart(2, "0");
  let footer = widget.addText(`🕒 ${hh}:${mm}`);
  footer.font = Font.systemFont(9);
  footer.textColor = new Color("#9ca3af");
  footer.leftAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentAccessoryRectangular();

  Script.complete();

} catch (e) {
  // ❌ Foutmelding tonen
  let widget = new ListWidget();
  widget.setPadding(6, 6, 6, 6);
  widget.backgroundColor = new Color("#7f1d1d");

  let error = widget.addText("⚠️ Fout bij laden");
  error.font = Font.boldSystemFont(11);
  error.textColor = Color.white();
  error.leftAlignText();

  let msg = widget.addText(e.toString());
  msg.font = Font.systemFont(8);
  msg.textColor = new Color("#fca5a5");
  msg.leftAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentAccessoryRectangular();

  Script.complete();
}
