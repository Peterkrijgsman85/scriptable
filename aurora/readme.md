# 🌌 Scriptable Aurora GPS Widget

Een slimme iOS-widget voor de [Scriptable](https://scriptable.app/) app die de actuele kans op het zien van noorderlicht op jouw locatie berekent. De widget combineert geomagnetische data, lokale bewolking en de stand van de zon voor een eerlijk beeld van de zichtbaarheid.



## ✨ Kenmerken
- **Real-time GPS:** Berekent alles op basis van je huidige coördinaten.
- **Slimme Kansberekening:** De getoonde kans (%) in de badge houdt direct rekening met bewolking en daglicht.
- **Kp-index Grafiek:** Toont het verloop van de magnetische activiteit over de afgelopen 30 uur met een duidelijke hulplijn bij **KP 6** (de drempel voor Nederland/België).
- **Dynamische Status:** Geeft tekstuele feedback zoals "DAGLICHT" of "BEWOLKT" wanneer de omstandigheden niet optimaal zijn.

## 📊 Hoe de "Kans op Zicht" werkt
In tegenstelling tot veel andere widgets toont deze badge niet alleen de magnetische kans, maar de **werkelijke kans op zicht**. De berekening werkt als volgt:

$$\text{Zichtkans} = \text{Magnetische Kans (NOAA)} \times \left( \frac{100 - \text{Bewolking \%}}{100} \right)$$

- **Bij daglicht:** De kans wordt direct op **0%** gezet (noorderlicht is overdag niet zichtbaar).
- **Bij bewolking:** Is het 50% bewolkt? Dan wordt de magnetische kans gehalveerd. Is het 100% bewolkt? Dan is de kans op zicht 0%.



## 🚀 Installatie

1. **Download Scriptable:** Installeer de [Scriptable app](https://apps.apple.com/nl/app/scriptable/id1405459188) in de App Store.
2. **Script aanmaken:**
   - Open Scriptable en tik op het plusje (**+**).
   - Kopieer de code uit het script-bestand in deze repo en plak deze in de editor.
   - Geef het script de naam `Aurora-GPS`.
3. **GPS Toestemming:**
   - Draai het script één keer handmatig in de app (tik op de Play-knop).
   - Geef toestemming voor het gebruik van je locatie.
4. **Widget instellen:**
   - Voeg een **Scriptable (Small)** widget toe aan je iOS beginscherm.
   - Houd de widget ingedrukt, kies **Wijzig widget** en selecteer het `Aurora-GPS` script.

## 🛠️ Gebruikte API's
- **NOAA SWPC:** Voor de Kp-index en het Ovation Aurora-model.
- **Open-Meteo:** Voor real-time bewolking en astronomische dag/nacht data.
- **Apple Maps:** Voor reverse geocoding (het omzetten van coördinaten naar een stadsnaam).

## ⚠️ Probleemoplossing
- **"Locatie niet gevonden":** Zorg dat de locatievoorzieningen voor Scriptable op "Bij gebruik van app of widgets" staan via `Instellingen > Privacy`.
- **"Data error":** Controleer je internetverbinding; de widget heeft toegang nodig tot de NOAA en Open-Meteo servers.

---
*Gemaakt voor noorderlichtjagers die verder kijken dan alleen de Kp-waarde.*
