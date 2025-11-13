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
widget.setPadding(10, 10, 10, 10);
widget.backgroundColor = new Color("#111827"); // Donkergrijs/blauw

// 🏷️ Titel
let title = widget.addText(name);
title.font = Font.boldSystemFont(14);
title.textColor = Color.white();
title.centerAlignText();

widget.addSpacer(6);

// 🚗 Status 1
let t1 = widget.addText(`Punt 1: ${s0}`);
t1.font = Font.mediumSystemFont(12);
t1.textColor = s0 === "Beschikbaar" ? Color.green() : Color.red();
t1.centerAlignText();

// ⚡ Status 2
let t2 = widget.addText(`Punt 2: ${s1}`);
t2.font = Font.mediumSystemFont(12);
t2.textColor = s1 === "Beschikbaar" ? Color.green() : Color.red();
t2.centerAlignText();

widget.addSpacer(4);

// 🕒 Laatst geüpdatet
let now = new Date();
let time = widget.addText(`Laatste update: ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`);
time.font = Font.systemFont(9);
time.textColor = new Color("#9CA3AF");
time.centerAlignText();

// 🧩 Toon widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}

Script.complete();
