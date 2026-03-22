# 🚔 AP Police AI Complaint Portal — Modular Codebase

## Project Structure

```
ap_police_portal/
├── index.html                          ← Entry point (open this in browser)
├── README.md                           ← This file
│
├── styles/
│   └── main.css                        ← Full design system (CSS variables, all components)
│
├── data/
│   └── constants.js                    ← LANGS, TYPES, seed complaints, officers, India locations
│
├── utils/
│   └── helpers.js                      ← getSLAStatus, sendSMSWA, seededRand, getDistrictData
│
├── components/
│   ├── ui-components.js                ← Avatar, Notif, SBadge, PBadge, StatusTracker, StarRating, SLAIndicator
│   │
│   ├── modals/
│   │   ├── EvidenceViewerModal.js      ← Photo/video/PDF evidence viewer
│   │   ├── FIRModal.js                 ← CCTNS e-FIR auto-generator
│   │   ├── OfficerMessaging.js         ← Encrypted inter-officer chat
│   │   ├── WitnessCoordModal.js        ← Witness & victim coordination
│   │   ├── ReassignModal.js            ← Case reassign / escalate
│   │   ├── NotificationModal.js        ← SMS + WhatsApp victim notifier
│   │   ├── SLAAlerts.js               ← SLA breach alert sidebar
│   │   └── StatusNotesPanel.js         ← Status update + internal notes
│   │
│   ├── officer/
│   │   ├── OfficerDashboard.js         ← Full officer case management (9 modules)
│   │   └── OfficersByLocation.js       ← State/district officer directory (32+ officers)
│   │
│   ├── citizen/
│   │   ├── WAPanel.js                  ← WhatsApp Bot animated demo
│   │   └── CitizenPortal.js            ← AI Chat + Status Tracker + History + Complaint Form
│   │
│   └── admin/
│       ├── CommandDashboard.js         ← SP/DCP command view (all states/districts)
│       ├── AutomatedReports.js         ← Daily report scheduler + generator
│       ├── CrimeHeatmap.js             ← India crime heatmap (36 states, 4 view modes)
│       ├── OfficerPerformance.js       ← Per-officer metrics + radar chart
│       ├── TrendAnalysis.js            ← Weekly/monthly trend charts + spike detection
│       ├── AIAccuracyMonitor.js        ← AI accuracy trends + override log
│       ├── PredictivePolicing.js       ← ML risk radar + patrol recommendations
│       ├── CustomReportBuilder.js      ← Filtered report builder + CSV export
│       └── AdminAnalytics.js           ← Tab container for all 8 modules
│
├── pages/
│   ├── AIEngine.js                     ← Live 4-step AI classification demo
│   ├── HomePage.js                     ← Landing page with stats + feature cards
│   ├── Footer.js                       ← 4-column footer
│   └── LoginModal.js                   ← 3-role login (Citizen OTP / Officer / Admin)
│
└── app/
    └── App.js                          ← Root component: auth, routing, global state
```

## How to Run

**Option 1 — Python local server (recommended):**
```bash
cd ap_police_portal
python3 -m http.server 8080
# Open: http://localhost:8080
```

**Option 2 — Any static web server:**
Upload the entire folder to Nginx, Apache, Vercel, Netlify, or AWS S3.

> ⚠️ **Do NOT open index.html directly** (file://) — browsers block cross-origin
> script loading for local files. Use a local server instead.

## Demo Login Credentials

| Role    | Email                         | Password / OTP                           |
|---------|-------------------------------|------------------------------------------|
| Citizen | Any 10-digit mobile number    | OTP from Firebase Phone Auth (sent via SMS) |
| Officer | officer@appolice.gov.in       | officer123 (for demo)                    |
| Admin   | admin@appolice.gov.in         | admin123 (for demo)                      |

## Module Load Order

Scripts must load in this order (index.html handles this automatically):

1. `data/constants.js` — all global data
2. `utils/helpers.js` — utility functions
3. `components/ui-components.js` — shared UI components
4. `components/modals/*.js` — modal dialogs
5. `components/officer/*.js` — officer dashboard
6. `components/citizen/*.js` — citizen portal
7. `components/admin/*.js` — admin analytics (all 8 modules)
8. `pages/*.js` — page-level components
9. `app/App.js` — root + ReactDOM.render

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 (UMD) | Component rendering, state management |
| Babel Standalone | In-browser JSX compilation |
| Chart.js 4.4 | Analytics charts (bar, line, radar, doughnut) |
| DM Sans · Sora · Noto Sans Telugu | Multilingual typography |
| CSS Variables | Design token system |

## Features by Module

| Module | Key Features |
|--------|-------------|
| CitizenPortal | AI Chat, Status Tracker, Complaint Form, History |
| WAPanel | WhatsApp Bot demo in Telugu, Open WhatsApp link |
| OfficerDashboard | 9 action modules, SLA tracking, complaint queue |
| AdminAnalytics | 8 intelligence modules, command dashboard, predictive policing |
| AIEngine | Live 4-step classification pipeline demo |
| LoginModal | OTP citizen login, officer/admin email+password |
