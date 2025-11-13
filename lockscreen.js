// 🔒 Lock Screen widget – Shell Recharge
// URL: https://ui-map.shellrecharge.com/api/map/v2/locations/4452657

const url = "https://ui-map.shellrecharge.com/api/map/v2/locations/4452657";

// 🟢 Data ophalen
let req = new Request(url);
let json = await req.loadJSON();

// 🔍 Data uitlezen
let name = json.name;
let status0 = json.evses[0].status;
let status1 = json.evses[1].status;

// 🔠 Vertaal status
function vertaalStatus(status) {
  switch (status.toUpperCase()) {
    case "AVAILABLE": return "✅";
    case "OCCUPIED": return "❌";
    case "OUTOFORDER": return "⚠️";
    default: return "❔";
  }
}

let s0 = vertaalStatus(status0);
let s1 = vertaalStatus(status1);

// 🔒 Lock Screen widget-tekst
let text = `${name}\n🔌${s0}  🔌${s1}`;

// 🧩 Widget maken
let widget = new ListWidget();
let txt = widget.addText(text);
txt.font = Font.systemFont(12);
txt.textColor = Color.white();
txt.centerAlignText();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentAccessoryRectangular(); // Gebruik voor test op lockscreen-formaat
}

Script.complete();
