# 📱 Shell Recharge – iOS Scriptable Widget  

Een compacte **Scriptable widget voor iOS** die de status toont van een Shell Recharge-laadstation, inclusief:

- Beschikbaar / Bezet / Defect  
- Laatste update-tijd  
- Status van beide connectoren  
- Optionele **push notificaties** bij statuswijzigingen  
- Moderne UI met kleuraccenten en emoji-iconen  

De widget werkt met elke laadpaal die zichtbaar is op de Shell Recharge-kaart.

---

## 🚀 Functies

### ✔ Live status van beide laadpunten  
De widget toont voor elke connector:

- Emoji-icoon  
- Statusbadge  
- Laatste update tijdstip  

### ✔ Push notificaties (optioneel)  
Ontvang een melding zodra één van de laadpunten van status verandert.  
Voorbeeldmelding:

Plug 1: Bezet → Beschikbaar
Plug 2: Beschikbaar → Beschikbaar


### ✔ Moderne layout  
Ontworpen voor kleine iOS-widgets, met gradients en nette typografie.

---

## ⚙️ Installatie

1. Installeer **Scriptable** (gratis in de App Store)  
2. Maak een **nieuw script**  
3. Plak de volledige code uit dit project  
4. Voeg een **widget** toe op je homescreen  
5. Kies bij *Configure → Script* dit script  
6. Vul de widget-parameter in (zie hieronder)

---

## 🔧 Widget Parameters

De widget ondersteunt parameters om meldingen in of uit te schakelen.

| Parameter | Betekenis |
|----------|-----------|
| `4452657` | Alleen status tonen |
| `4452657 alert` | Status tonen + notificaties bij wijziging |

### 🔔 Alerts inschakelen

4452657 alert

### 🔕 Alerts uit

4452657


---

## 🔍 Laadpaal-ID achterhalen via Shell Recharge

Het script heeft het **locatie-ID van het laadstation** nodig.  
Die kun je vinden via de website van Shell Recharge:

1. Ga naar:  
   **https://account.shellrecharge.com/**
2. Log in  
3. Open **Developer Tools** in Google Chrome  
   - Rechtsklik → *Inspecteren*  
   - Ga naar tab **Network**  
4. Navigeer naar jouw laadpaal  
5. Zoek in de netwerkrequests naar regels zoals:  /locations/4452657
6. Het nummer na `/locations/` is het **laadpaal-ID**

Gebruik dat ID in de widget-parameter.

---

## 🛎 Hoe werken de statusmeldingen?

- Het script slaat de vorige status lokaal op  
- Bij elke widget-refresh wordt de nieuwe status vergeleken met de oude  
- Is er verschil én staan alerts aan → dan ontvang je een pushmelding  
- Alleen echte veranderingen genereren notificaties (dus niet bij elke update)

---

## 📝 Vereisten

- iOS 16+  
- Scriptable  
- Internettoegang  

---

## 📄 Licentie

Vrij te gebruiken, aan te passen en te delen.  


