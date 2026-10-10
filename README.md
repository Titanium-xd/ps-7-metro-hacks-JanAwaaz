# Live Deployed: https://ps-7-metro-hacks-jan-awaaz.vercel.app/

# JanAwaaz (जनआवाज़)
### Offline-First Metro Grievance Intelligence
**Official Prototype for DevFest Gandhinagar Hackathon — Problem Statement PS-07, Every Complaint Heard**

> *"हर आवाज़ से सही कार्रवाई तक।"*  
> *"From Every Voice to the Right Action."*

---

## 1. Executive Summary & Problem Context

In high-density rapid transit systems like **Gujarat Metro Rail Corporation (GMRC)**, passenger grievances flood operational channels around the clock:
- **Disparate Channels:** Mobile apps, Twitter/X, emails, paper feedback slips, and in-person customer counter complaints.
- **Multilingual Reality:** Feedback arrives in English, Gujarati script, Hindi (Devanagari), and mixed Latin Romanized transliteration ("Gujlish" / "Hinglish").
- **Triage Latency:** Manual sorting takes hours. Critical safety emergencies (e.g. electrical short circuits, passengers trapped in elevators, platform fires) risk getting buried beneath routine litter or ticketing queries.
- **Network Blackouts:** Station controllers frequently operate in underground concourses or during network disruptions without internet access.

**JanAwaaz (जनआवाज़)** solves this by providing an **offline-first, explainable AI decision support system**. It runs on-device in the browser using client-side TypeScript heuristics, Unicode script analysis, and IndexedDB persistence. It instantly triages incoming complaints into department queues, computes transparent 0–100 urgency scores, generates language-aware response drafts, and maintains an auditable operations console.

---

## 2. Key Features

### 🛡️ Signature Feature: "Urgent First Shield"
- **Priority Escalation Console:** Instantly surfaces critical unresolved grievances (Urgency $\ge$ 65 or Safety hazards) at the very top of the desk.
- **Explainable Reasoning:** Every escalation displays explicit, human-readable rationale chips (e.g., *"Critical safety: Electrical sparks & smoke"*, *"Passenger trapped in lift"*, *"Accessibility barrier with wheelchair"*).
- **Controller Action Triggers:** 1-click **Acknowledge**, **Escalate to Station Master**, or **Draft Reply**, automatically logged to the audit trail.

### 🌐 Pure Offline Multilingual Classification (Zero Cloud API Dependency)
- **Languages Supported:**
  - Gujarati Script (ગુજરાતી) — Unicode range `\u0A80-\u0AFF`
  - Hindi Script (हिन्दी / देवनागरी) — Unicode range `\u0900-\u097F`
  - English
  - Gujlish / Hinglish (e.g., *"Platform 1 par smoke che ane short circuit thai che"*, *"paise kapai gaya pan balance nathi aavyu"*)
- **Department Queues:**
  1. `Safety`
  2. `Lifts & Accessibility`
  3. `Cleanliness`
  4. `Fare & Ticketing`
  5. `Staff Behaviour`
  6. `Other / Needs Review` (assigned when confidence is low or ambiguous)

### ⚖️ Explainable Urgency Scoring (0–100)
- **Tier Breakdown:**
  - **CRITICAL (80–100):** Fire, smoke, electrical sparks, bare wires, trapped passengers, medical fainting.
  - **HIGH (60–79):** Wheelchair / senior accessibility barriers, platform glass hazards, aggressive altercation.
  - **MEDIUM (35–59):** Fare overcharging, smart card recharge failure, unhelpful staff.
  - **ROUTINE (0–34):** Routine litter, spitting, timetable suggestions (capped at 35 to prevent false emergency inflation).
- **Repeated Issue Booster:** Automatically correlates multiple open complaints at the same station & department (+12 pts escalation).

### ✍️ Language-Aware Draft Replies
- Generates tailored, polite official responses in the complainant's detected language.
- Context-sensitive templates for Gujarati, Hindi, English, and Gujlish.
- Includes station name and reference ID.
- Full operator editing capability and 1-click clipboard copy.
- Ethical safety notice: Never falsely claims dispatch or gives unverified arrival times.

### 📥 Dual Complaint Intake
1. **Manual Grievance Entry:** Single form with GMRC Phase-II station selector, channel selector, and **real-time on-the-fly triage preview**.
2. **Batch Intake (CSV & Text Paste):** Interactive pre-import review table where operators can inspect detected language, predicted department, and urgency score, and make corrections **before** committing.

### 💾 100% Offline Persistence & Outbox Sync
- Persistent browser-side **IndexedDB** database (`LokSuno_Metro_Ops_DB`) with localStorage fallback.
- **Service Worker** (`sw.js`) caches the application shell for offline reloads.
- Built-in **Simulated Offline Mode** toggle for live hackathon demonstration.
- Full backup export/import (JSON) and report export (CSV).

---

## 3. Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Custom Metro Control Desk Design System (Vanilla CSS tokens, responsive layout, dark/light contrast)
- **Icons:** Lucide React
- **Persistence:** Browser IndexedDB (Native IDB Transaction API)
- **Offline Shell:** Progressive Web App (PWA) Service Worker cache
- **Testing:** Vitest (20 automated unit tests passing in 11ms)

```
d:/metro-hacks/
├── public/
│   ├── manifest.json            # PWA Manifest (JanAwaaz)
│   ├── sw.js                    # Offline Service Worker
│   └── vite.svg                 # Metro Shield Vector Brand
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Control Desk Top Bar & Offline Toggle (JanAwaaz जनआवाज़)
│   │   ├── MetricsBar.tsx       # Calculated KPI Cards & Queue Filters
│   │   ├── UrgentShield.tsx     # Signature Urgent First Shield
│   │   ├── ComplaintTable.tsx   # Ranked Actionable Complaint List
│   │   ├── ComplaintDetailModal.tsx # Inspection, Draft Reply & Audit Trail
│   │   ├── ManualIntakeModal.tsx # Single Grievance Form + Real-time Preview
│   │   ├── BatchIntakeModal.tsx # CSV / Paste Intake & Review Table
│   │   └── ExportModal.tsx      # Backup JSON, CSV Export & Sync Outbox
│   ├── data/
│   │   ├── gmrcStations.ts      # Official GMRC Phase-II Stations
│   │   └── seedComplaints.ts    # Rich Multilingual Test Complaints
│   ├── services/
│   │   ├── classifier.ts        # Pure TypeScript Multilingual Classifier
│   │   ├── urgency.ts           # Explainable Urgency Scoring Engine
│   │   ├── draftReplies.ts      # Multi-Language Template Generator
│   │   ├── csvParser.ts         # Robust CSV Line Parser & Exporter
│   │   ├── storage.ts           # IndexedDB Persistence & Backup Engine
│   │   └── __tests__/           # Vitest Automated Test Suite
│   ├── types/
│   │   └── index.ts             # Domain Models & Enums
│   ├── App.tsx                  # Main Control Desk Application
│   ├── index.css                # Metro Console Theme Tokens
│   └── main.tsx                 # App Mount
├── resources/                   # Starter Pack Reference Data
├── package.json
└── vite.config.ts
```

---

## 4. Installation & Local Setup

### Prerequisites
- Node.js $\ge$ v18 (Tested on Node v24.12.0)
- npm $\ge$ v9

### Commands

```bash
# 1. Clone repository & navigate to directory
cd d:/metro-hacks

# 2. Install dependencies
npm install

# 3. Run automated test suite (20 tests covering classifiers, urgency, drafts, CSV)
npm test

# 4. Start local development server
npm run dev

# 5. Access the application in your browser
# URL: http://127.0.0.1:5173/
```

To create a production bundle:
```bash
npm run build
npm run preview
```

---

## 5. Seed & Test Data

The application automatically seeds a diverse set of representative multilingual test complaints on first load, and includes a **"Demo Batch"** button in the navbar to reset or refresh at any time.

- Source seed generator: `src/data/seedComplaints.ts`
- GMRC Phase-II station reference: `src/data/gmrcStations.ts`
- Sample CSV data: Embedded in the Batch Intake modal under *"Load Sample Test CSV"*.

All records use synthetic passenger grievances and fictional reference IDs, respecting privacy and hackathon guidelines.

---

## 6. How to Demonstrate Offline Operation

1. Open `http://127.0.0.1:5173/` in Google Chrome or Microsoft Edge.
2. Observe the green **`ONLINE (SYNCED)`** pill in the top navbar.
3. Click the pill to toggle **Simulated Offline Mode** (or disconnect your machine's Wi-Fi / set Chrome DevTools Network to *Offline*).
4. The status pill changes to amber **`OFFLINE (ON-DEVICE PERSISTED)`** and an alert banner confirms offline autonomy.
5. While offline:
   - Click **"Log Grievance"**, enter a new complaint in Gujarati or Hindi, and submit. It instantly persists to IndexedDB.
   - Click **"Acknowledge"** or **"Escalate"** on any alert in the Urgent First Shield.
   - Click **"Inspect"**, edit a response draft, and copy it to the clipboard.
   - Click **"Batch Intake"** and import CSV rows.
6. Refresh the page while disconnected — the application shell reloads seamlessly from the Service Worker cache, and all IndexedDB data remains intact.
7. Click the status pill to reconnect. All pending records are tracked in the Outbox.

---

## 7. Recommended 60-Second Demonstration Script

| Time | Action | What to Highlight |
|---|---|---|
| **00:00 - 00:10** | Open Dashboard | Point out **JanAwaaz (जनआवाज़)** branding, tagline *"हर आवाज़ से सही कार्रवाई तक।"*, KPIs (Total Intake, Urgent Unresolved, Queues), and GMRC Phase-II station integration. |
| **00:10 - 00:25** | Urgent First Shield | Show the top card: *"Urgent! Heavy electrical sparking and smoke..."* (Score 100). Highlight the **explainable reason chips** explaining *why* it was prioritized over routine complaints. |
| **00:25 - 00:35** | Multilingual Drafts | Click **"Inspect"** on a Gujarati trapped lift complaint (`LS-2026-002`). Show the original Gujarati script and the auto-generated official Gujarati draft reply with reference ID. Click **"Copy Draft"**. |
| **00:35 - 00:45** | Manual Intake Real-time Preview | Click **"Log Grievance"**. Select *GIFT City*. Type: *"Platform 1 par smoke che ane short circuit thai che"*. Show the **live on-the-fly classifier** predicting Safety, Gujlish, Score 100 before saving. |
| **00:45 - 00:55** | Batch CSV Intake | Click **"Batch Intake"** $\rightarrow$ **"Load Sample Test CSV"**. Show the pre-import review table where operators can modify categories before committing. Import the records. |
| **00:55 - 01:00** | Offline Independence | Click **"ONLINE (SYNCED)"** to demonstrate instant on-device offline resilience with IndexedDB. |

---

## 8. Automated Test Results

The suite includes comprehensive unit tests verifying all algorithmic requirements:

```
 ✓ src/services/__tests__/loksuno.test.ts (20 tests)
   ✓ Language Detection (Gujarati, Hindi, Gujlish, English)
   ✓ Department Classification (Safety, Lifts, Cleanliness, Fare, Staff, Ambiguous)
   ✓ Explainable Urgency Scoring (Critical floor for fire/smoke, trapped passengers)
   ✓ Cleanliness Safety Cap (Ensuring routine litter stays <= 35)
   ✓ Repeated Issue Escalation (Cross-checking station & department duplicates)
   ✓ Language-Aware Response Drafts (Accurate Gujarati, Hindi, English templates)
   ✓ Robust CSV Line Parsing (Quotes, commas, multiline cells)
```

Run tests anytime with:
```bash
npm test
```

---

## 9. Known Limitations & Roadmap

- **Phonetic Transliteration Diversity:** While Gujlish and Hinglish rules cover 40+ common romanized patterns, regional slang with non-standard spelling benefits from operator review (hence the explicit *"Other / Needs Review"* queue).
- **Audio / Voice Grievances:** Currently supports text input from digital and paper sources; integration with on-device Web Speech API for voice recordings is a natural Phase-II extension.
- **Central Depot Sync:** Local outbox architecture is prepared; in production, this would synchronize via an authenticated HTTPS worker when connectivity returns.

---

## 10. Hackathon Compliance

- **No Cloud API or External AI Dependences:** Operates 100% locally on-device.
- **No Hosted Fonts or CDNs:** Uses system typography fallbacks to guarantee offline rendering.
- **Data Privacy:** Synthetic demonstration data only; zero personal passenger data included.
- **Clean Architecture:** Strict separation of types, heuristic classifiers, storage, and UI components.

*DevFest Gandhinagar PS-07, Every Complaint Heard — JanAwaaz (जनआवाज़): Built with precision, reliability, and human-in-the-loop explainability.*
