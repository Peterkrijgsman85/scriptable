// Kleine Scriptable widget voor Shell Recharge locatie
// URL: https://ui-map.shellrecharge.com/api/map/v2/locations/4452657

const url = "https://ui-map.shellrecharge.com/api/map/v2/locations/4452657";

// 🟢 Data ophalen van de API
let req = new Request(url);
let json = await req.loadJSON();

// 🔍 Gegevens uitlezen
let name = json.name;
let status0 = json.evses[0].status;
let status1 = json.evses[1].status;

// 🔠 Vertaal status
function vertaalStatus(status) {
  switch (status.toUpperCase()) {
    case "AVAILABLE": return "Beschikbaar";
    case "OCCUPIED": return "Bezet";
    case "OUTOFORDER": return "Defect";
    default: return status;
  }
}

let s0 = vertaalStatus(status0);
let s1 = vertaalStatus(status1);

// 🎨 Widget maken
let widget = new ListWidget();
widget.setPadding(16, 16, 14, 16);

// 🌈 Gradient achtergrond
let gradient = new LinearGradient();
gradient.colors = [new Color("#0097bb"), new Color("#ffffff")];
gradient.locations = [0.0, 1.0];
gradient.startPoint = new Point(0, 0);
gradient.endPoint = new Point(1, 1);
widget.backgroundGradient = gradient;

// 🔝 Titelbalk (links naam, rechts ⚡️)
let header = widget.addStack();
header.layoutHorizontally();
header.centerAlignContent();

let title = header.addText(name);
title.font = Font.semiboldSystemFont(13);
title.textColor = new Color("#0f172a");
title.leftAlignText();

header.addSpacer();

let icon = header.addText("⚡️");
icon.font = Font.systemFont(15);
icon.textColor = new Color("#facc15");

widget.addSpacer(10);

// ⚡ Functie om statusrijen te maken
function maakStatusRij(emoji, status) {
  let stack = widget.addStack();
  stack.layoutHorizontally();
  stack.centerAlignContent();

  // 🔌 Emoji links
  let plug = stack.addText(emoji);
  plug.font = Font.systemFont(12);
  plug.textColor = new Color("#0f172a");

  stack.addSpacer();

  // Status rechts
  let statusText = stack.addText(status);
  statusText.font = Font.semiboldSystemFont(13);
  statusText.rightAlignText();

  if (status === "Beschikbaar") {
    statusText.textColor = new Color("#059669"); // Groen
  } else if (status === "Bezet") {
    statusText.textColor = new Color("#dc2626"); // Rood
  } else {
    statusText.textColor = new Color("#ca8a04"); // Geel
  }

  return stack;
}

// 🔌🅿️ Punt 1 (met parkeericoon)
maakStatusRij("🔌🅿️", s0);
widget.addSpacer(6);

// 🔌 Punt 2
maakStatusRij("🔌", s1);

// Extra ruimte zodat footer losser onderaan staat
widget.addSpacer(12);

// 🕒 Laatst geüpdatet
let now = new Date();
let hh = now.getHours().toString().padStart(2, "0");
let mm = now.getMinutes().toString().padStart(2, "0");
let footer = widget.addText(`Laatste update: ${hh}:${mm}`);
footer.font = Font.systemFont(9);
footer.textColor = new Color("#334155");
footer.centerAlignText();

// 🧩 Toon widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}

Script.complete();
