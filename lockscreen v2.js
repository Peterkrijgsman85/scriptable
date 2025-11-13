// 🔒 Lock Screen widget – Shell Recharge
// 📍 Voorbeeld-API: https://ui-map.shellrecharge.com/api/map/v2/locations/4452657
// Gebruik als parameter: laadstation-ID (bijv. 4452657)

const stationId = args.widgetParameter ? args.widgetParameter.trim() : "4452657"; // default ID

const url = `https://ui-map.shellrecharge.com/api/map/v2/locations/${stationId}`;

try {
  // 🟢 Data ophalen
  let req = new Request(url);
  let json = await req.loadJSON();

  // 🔍 Data uitlezen
  let name = json.name;
  let evses = json.evses || [];
  let total = evses.length;
  let bezet = evses.filter(e => e.status.toUpperCase() === "OCCUPIED").length;
  let vrij = total - bezet;

  // 🔠 Vertaal status
  function vertaalStatus(status) {
    switch (status.toUpperCase()) {
      case "AVAILABLE": return "Beschikbaar";
      case "OCCUPIED": return "Bezet";
      case "OUTOFORDER": return "Defect";
      default: return "Onbekend";
    }
  }

  let statussen = evses.map(e => vertaalStatus(e.status)).join(" / ");

  // 🧩 Widget maken
  let widget = new ListWidget();
  widget.setPadding(8, 10, 8, 10);
  widget.backgroundColor = new Color("#1e1e1e", 0.6); // halftransparant grijs

  // ⚡️ Titel met emoji + naam
  let titleStack = widget.addStack();
  titleStack.layoutHorizontally();
  titleStack.centerAlignContent();

  let icon = titleStack.addText("⚡️ ");
  icon.font = Font.semiboldSystemFont(13);
  icon.textColor = Color.white();

  let title = titleStack.addText(name);
  title.font = Font.semiboldSystemFont(13);
  title.textColor = Color.white();

  widget.addSpacer(2);

  // ⚡️ Statustekst
  let statusLine = widget.addText(statussen);
  statusLine.font = Font.boldSystemFont(12);
  statusLine.textColor = Color.white();
  statusLine.leftAlignText();

  widget.addSpacer(4);

  // 📊 Bezettingsbalk tekenen
  const barWidth = 120;
  const barHeight = 5;
  const ctx = new DrawContext();
  ctx.size = new Size(barWidth, barHeight);
  ctx.opaque = false;
  ctx.setFillColor(new Color("#374151")); // achtergrond van balk (grijs)
  ctx.fillRect(new Rect(0, 0, barWidth, barHeight));

  // Vul afhankelijk van bezetting
  let ratio = bezet / total;
  let fillColor = bezet === 0 ? new Color("#22c55e") : bezet === 1 ? new Color("#facc15") : new Color("#ef4444");
  ctx.setFillColor(fillColor);
  ctx.fillRect(new Rect(0, 0, barWidth * ratio, barHeight));

  let barImage = ctx.getImage();
  let bar = widget.addImage(barImage);
  bar.centerAlignImage();

  widget.addSpacer(4);

  // 🕒 Tijdstip
  let now = new Date();
  let hh = now.getHours().toString().padStart(2, "0");
  let mm = now.getMinutes().toString().padStart(2, "0");
  let footer = widget.addText(`🕒 ${hh}:${mm}`);
  footer.font = Font.systemFont(9);
  footer.textColor = new Color("#d1d5db");
  footer.leftAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentAccessoryRectangular();

  Script.complete();

} catch (e) {
  // ❌ Foutmelding tonen
  let widget = new ListWidget();
  widget.setPadding(6, 6, 6, 6);
  widget.backgroundColor = new Color("#7f1d1d", 0.6);

  let error = widget.addText("⚠️ Fout bij laden");
  error.font = Font.boldSystemFont(11);
  error.textColor = Color.white();
  error.leftAlignText();

  if (config.runsInWidget) Script.setWidget(widget);
  else widget.presentAccessoryRectangular();

  Script.complete();
}
