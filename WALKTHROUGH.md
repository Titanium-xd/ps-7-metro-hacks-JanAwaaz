# JanAwaaz (जनआवाज़) — Walkthrough Guide
### Offline-First Metro Grievance Intelligence
**Official Prototype for DevFest Gandhinagar Hackathon — Problem Statement PS-07, Every Complaint Heard**

> *"हर आवाज़ से सही कार्रवाई तक।"*  
> *"From Every Voice to the Right Action."*

---

## 1. Project Overview & Context

**JanAwaaz (जनआवाज़)** is an on-device, offline-first operational control desk designed for station controllers and central transit desks across the **Gujarat Metro Rail Corporation (GMRC)** network.

Passenger grievances arrive continuously across disparate channels (Mobile Apps, Twitter/X, Emails, Paper feedback slips) and in multiple languages (**English, Gujarati script, Hindi Devanagari, and Romanized "Gujlish" / "Hinglish"**). Under normal operations, manual triage takes hours, and urgent safety emergencies can get buried beneath routine complaints. During underground station operations or network outages, internet access is unavailable.

JanAwaaz solves this with:
- **Zero External API / LLM Dependencies:** Pure client-side heuristic classification and urgency scoring algorithms.
- **100% Offline Resilience:** Browser IndexedDB storage, Service Worker application shell caching, and an outbox queue architecture.
- **Explainable Decisions:** Transparent reason tags for every urgency score and priority escalation.
- **Language-Aware Draft Responses:** Contextual response drafts in the complainant's language with station name and reference ID.

---

## 2. System Architecture & Component Map

```
d:/metro-hacks/
├── public/
│   ├── manifest.json            # PWA Manifest (JanAwaaz branding)
│   ├── sw.js                    # Offline Service Worker (caching app shell)
│   └── vite.svg                 # Metro Shield Vector Logo
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Top Operations Header, Status Badge & Offline Simulator
│   │   ├── MetricsBar.tsx       # Real-time KPI summary cards & department counters
│   │   ├── UrgentShield.tsx     # Signature Feature: Urgent First Shield
│   │   ├── ComplaintTable.tsx   # Actionable complaints table with filters & search
│   │   ├── ComplaintDetailModal.tsx # Full complaint inspector, draft replies & audit trail
│   │   ├── ManualIntakeModal.tsx # Single grievance logger with on-the-fly classifier preview
│   │   ├── BatchIntakeModal.tsx # CSV file upload & paste batch with pre-import review table
│   │   └── ExportModal.tsx      # JSON/CSV backup, export, and outbox synchronization
│   ├── data/
│   │   ├── gmrcStations.ts      # 22 Official GMRC Phase-II Stations
│   │   └── seedComplaints.ts    # Multilingual representative test complaints
│   ├── services/
│   │   ├── classifier.ts        # Multilingual classifier (Gujarati, Hindi, English, Gujlish)
│   │   ├── urgency.ts           # Explainable urgency scoring engine (0-100) & duplicate detector
│   │   ├── draftReplies.ts      # Multi-language response draft generator
│   │   ├── csvParser.ts         # Robust CSV line parser, batch processor & exporter
│   │   ├── storage.ts           # Native IndexedDB persistence & backup manager
│   │   └── __tests__/           # Vitest unit test suite (20 automated tests)
│   ├── types/
│   │   └── index.ts             # Domain models, enums & interfaces
│   ├── App.tsx                  # Main Control Desk state manager
│   ├── index.css                # Metro Console design system & tokens
│   └── main.tsx                 # Application entry point
├── README.md                    # Public GitHub-ready documentation
└── WALKTHROUGH.md               # This walkthrough guide
```

---

## 3. Step-by-Step Workflow Walkthrough

### Workflow 1: The Operations Command Desk & KPI Metrics Bar

When you open the application at `http://127.0.0.1:5173/`:
1. **Top Header:**
   - Displays the **JanAwaaz जनआवाज़** brand identity, GMRC PS-07 badge, the Hindi & English taglines (*"हर आवाज़ से सही कार्रवाई तक। • From Every Voice to the Right Action."*), and the real-time connectivity status pill: `ONLINE (SYNCED)` or `OFFLINE (ON-DEVICE PERSISTED)`.
   - Action buttons: **Demo Batch**, **Batch Intake**, **Log Grievance**, and **Backup**.
2. **KPI Summary Cards:**
   - **Total Intake:** Live count of all complaints stored in IndexedDB.
   - **Urgent Unresolved:** Count of high-stakes unresolved complaints ($\text{Urgency} \ge 60$ and $\text{Status} \ne \text{'Resolved'}$). Highlighted in bold red.
   - **Review Required:** Number of ambiguous or low-confidence complaints routed to *"Other / Needs Review"*.
   - **Resolved:** Total closed complaints with an audit trail.
3. **Department Queue Pills:**
   - Real-time counts for all 6 departments: **Safety**, **Lifts & Accessibility**, **Cleanliness**, **Fare & Ticketing**, **Staff Behaviour**, and **Other / Needs Review**.
   - Clicking any department pill filters the table below to that specific queue.

---

### Workflow 2: Signature Feature — "Urgent First Shield"

Located directly below the KPI bar, the **Urgent First Shield** is a dedicated command panel that prevents critical safety incidents from ever being missed:
- **Priority Escalation Logic:** Automatically extracts complaints with an Urgency Score $\ge 65$ or routed to the `Safety` department that are not yet resolved.
- **Explainable Decision Factors:** Each emergency card features red alert badges explaining *why* the algorithm escalated it:
  - *"Critical safety phrase detected: Electrical sparking & smoke"*
  - *"Possible trapped passenger in lift"*
  - *"Accessibility barrier: Wheelchair passenger unable to access platform"*
- **Rapid Controller Actions:**
  - **Acknowledge:** Changes status to `In Progress` with an automatic timestamped audit entry.
  - **Escalate:** Escalates status to `Escalated` for safety desk dispatch.
  - **Draft Reply:** Immediately opens the inspection modal pre-loaded with an official response in the complainant's language.

---

### Workflow 3: Complaint Detail Inspection & Multilingual Response Drafts

Clicking **"Inspect"** on any complaint opens the detailed modal with 4 specialized tabs:

1. **Response Draft & Actions (Default Tab):**
   - Automatically selects the complainant's language (**Gujarati**, **Hindi**, **English**, or **Gujlish**).
   - Generates a formal, context-sensitive reply incorporating the specific **Station Name** and **Reference ID**.
   - Includes safety guidelines (e.g. *"Station controllers at Infocity have been notified for immediate on-site inspection. Please maintain a safe distance."*).
   - Full operator editing capability and a 1-click **"Copy Draft"** button.
   - Ethical Notice: Explains that local templates never promise false dispatch or unverified arrival times.
2. **Triage & Explainability Tab:**
   - Allows the operator to manually override the **Department Queue** and the **Urgency Score (0-100)** with a documented justification.
   - Displays the exact score breakdown: baseline points, matched keywords, and repeated issue multipliers.
3. **Internal Notes Tab:**
   - Station controllers can record operational notes (e.g. *"Housekeeping dispatched to Concourse B"*).
4. **Audit Trail Tab:**
   - Immutable chronological event log tracking every intake, status transition, priority override, and operator note.

---

### Workflow 4: Manual Complaint Intake with Real-Time Triage Preview

Clicking **"Log Grievance"** opens the single complaint entry form:
1. Select the intake channel: `App`, `Email`, `Social Media`, `Paper Form`, or `Other`.
2. Select the station from the complete list of 22 **GMRC Phase-II stations** (e.g., *GIFT City*, *Infocity*, *Sachivalaya*, *PDEU*).
3. Type raw grievance text in any language:
   - *Example:* `"Platform 1 par smoke che ane short circuit thai che"`
4. **Real-Time On-The-Fly Preview:**
   - As you type, the engine evaluates the text in real-time, showing detected language (`Gujlish/Hinglish`), predicted queue (`Safety`), and calculated urgency (`SCORE 100 - CRITICAL`).
5. Click **"Register Complaint"**: The record is committed to IndexedDB and placed at the top of the operations desk.

---

### Workflow 5: Batch CSV Intake & Interactive Pre-Import Correction

Clicking **"Batch Intake"**:
1. **Upload or Paste:**
   - Upload any CSV file (compatible with the starter pack's `sample_passenger_feedback.csv`).
   - Or paste multiple complaint lines directly into the text area.
   - Quick testing: Click **"Load Sample Test CSV"** to load a multi-language batch.
2. **Interactive Preview Table:**
   - Automatically parses lines, handling quotes, commas, and multiline text.
   - Displays detected language, predicted department, and urgency score for every row.
   - **Operator Corrections:** You can change the department dropdown or edit the urgency score directly inside the table **before** committing!
3. Click **"Import Records into Operations Desk"** to commit valid rows into IndexedDB.

---

### Workflow 6: On-Device Offline Operation & Resilience Testing

Offline capability is built into the core architecture:
1. **PWA Service Worker:** Pre-caches the application shell (`/index.html`, `/manifest.json`, styles, and bundled JS).
2. **IndexedDB:** All grievances, notes, and audit logs are stored in `LokSuno_Metro_Ops_DB` locally on the device (preserved to prevent data loss).
3. **Simulated Offline Mode:**
   - Click the green **`ONLINE (SYNCED)`** pill in the navbar.
   - The indicator switches to **`OFFLINE (ON-DEVICE PERSISTED)`** and an operational notice appears.
   - In this mode, intake, filtering, search, status updates, priority overrides, and draft replies continue functioning with zero network connectivity.
   - Hard refresh while disconnected: The application reloads seamlessly from the Service Worker cache.

---

### Workflow 7: Outbox Synchronization & Backup Export

Clicking **"Backup"** in the top bar:
- **On-Device Outbox Queue:** Displays records marked as `pending_sync`.
- **Mark Outbox as Synced:** Allows the controller to acknowledge queued records when connecting to a local depot station.
- **Export CSV File:** Generates a standard CSV report with all complaint metadata, urgency scores, and draft replies (`janawaaz_metro_complaints_*.csv`).
- **Export JSON Backup:** Downloads a complete JSON snapshot for backup and disaster recovery (`janawaaz_backup_snapshot_*.json`).
- **Restore Backup Snapshot:** Upload a previously saved JSON snapshot to restore all records.

---

## 4. Automated Test Suite Verification

The application includes an automated test suite ([loksuno.test.ts](file:///d:/metro-hacks/src/services/__tests__/loksuno.test.ts)) with 20 unit tests verifying all core requirements:

```bash
npm test
```

### Test Coverage Highlights:
- **Language Detection:** Accurately differentiates Gujarati script, Hindi script, English, and Romanized Gujlish.
- **Department Classification:** Routes electrical hazards to `Safety`, elevator barriers to `Lifts & Accessibility`, and ambiguous feedback to `Other / Needs Review`.
- **Explainable Urgency:** Enforces critical floors ($\ge 85$) for fire/smoke/trapped passengers; applies safety caps ($\le 35$) to routine cleanliness to avoid false emergencies.
- **Repeated Issue Detection:** Automatically identifies multiple open complaints at the same station & department and adds urgency points.
- **Response Draft Generation:** Validates that Gujarati, Hindi, English, and Gujlish draft responses are politely structured with proper station and reference markers.
- **CSV Parser:** Validates CSV lines with quotes, commas, and multiline text.

---

## 5. Recommended 60-Second Hackathon Demo Sequence

| Time | Action | Speaking Points |
|---|---|---|
| **0:00 - 0:10** | Open `http://127.0.0.1:5173/` | *"JanAwaaz (जनआवाज़) is an offline-first metro grievance intelligence console built for GMRC controllers under the motto 'हर आवाज़ से सही कार्रवाई तक।'"* |
| **0:10 - 0:25** | Point to **Urgent First Shield** | *"Here is our signature Urgent First Shield. High-risk safety issues like sparks at Infocity or a trapped passenger at GIFT City are escalated with transparent reasons."* |
| **0:25 - 0:35** | Click **"Inspect"** on Gujarati complaint | *"Notice the original Gujarati text. JanAwaaz automatically detects Gujarati script and generates an official Gujarati draft response with reference ID and station name."* |
| **0:35 - 0:45** | Click **"Log Grievance"** | *"Watch the real-time preview as I type: 'Platform 1 par smoke che ane short circuit thai che'. It immediately detects Safety, Gujlish, and Score 100 before saving."* |
| **0:45 - 0:55** | Click **"Batch Intake"** | *"We support batch CSV intake with an interactive review table where operators can inspect and correct predictions before importing."* |
| **0:55 - 1:00** | Click **`ONLINE (SYNCED)`** pill | *"Clicking here simulates an offline network cutoff. Every feature runs 100% on-device using IndexedDB and Service Workers with zero cloud dependencies."* |

---

*DevFest Gandhinagar PS-07, Every Complaint Heard — JanAwaaz (जनआवाज़): Offline-First Metro Grievance Intelligence.*
