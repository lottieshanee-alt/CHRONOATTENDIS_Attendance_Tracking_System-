# ChronoAttendis — Attendance Tracking System
### Official Attendance Tracking System for John B. Lacson Colleges Foundation – Bacolod (JBLCF-Bacolod)

**ChronoAttendis** is an institutional attendance monitoring dashboard engineered for faculty, officers, and administrators of JBLCF-Bacolod. It provides real-time barcode scan logging, station monitoring, academic section turnout analytics, and manual attendance override workflows.

> **Hardware note:** ChronoAttendis is designed for standard USB and Bluetooth HID keyboard-wedge barcode scanners (such as handheld laser/CCD scanners transmitting fast keystroke bursts ending in Carriage Return / Enter), alongside a manual lookup fallback. The system does not require specialized turnstile hardware or biometric/RFID readers.

---

## 🏛️ Visual Identity & Design System

- **Institutional Deep Blue** (`#0A1C33` / `#0E294B`): Maritime authority and corporate institutional foundation.
- **Academic Gold** (`#C99313` / `#DEB033`): Academic excellence and regimental insignia accents.
- **Crisp High-Contrast White** (`#FFFFFF` on `#F8FAFC`): Strict readability for faculty operational workflows.
- **Zero-Gradient Rule**: Prohibits generic AI gradients, utilizing solid, mathematically proportioned 8pt cards and borders.
- **Typographic System**: Tabular numeric fonts (`tabular-nums font-mono`) for precision counts, timestamps, and barcode strings.
- **Timezone**: All operations, timestamps, and cutoffs strictly adhere to Asia/Manila (PHT, UTC+8).

---

## ⚡ Core Features

1. **Institutional Navigation & Controls**:
   - Navigation across `Dashboard`, `Teacher & Faculty`, `Students & Cadets`, `Notice Board`, and `Edit Account`.
   - Real-time scanner keystroke listener status indicator with fast-burst test diagnostics.
   - Authorized officer profile and configuration.

2. **Top Metrics Bar with Period Switching**:
   - **Total Enrolled** (institutional strength baseline).
   - **Present Count & Turnout Rate** (confirmed scans with comparative day-over-day delta).
   - **Absences & Late Arrivals** (unexcused, excused, and late arrivals).
   - Configurable optional gender split metrics.
   - Switching between **Today's Attendance** and historical records.

3. **Analytics & Trends**:
   - **Attendance Overview Chart**: Hourly velocity curve (06:00 AM – 05:00 PM) tracking station check-ins and departures.
   - **Attendance by Class / Department Chart**: Headcount present vs enrolled capacity across sections with interactive department filter pills.

4. **Calendar & Live Activity Stream**:
   - **Academic Calendar**: Dynamic month calendar highlighting academic events, ceremonies, and examinations.
   - **Live Activity Stream**: Real-time scan logs detailing cadet name, student ID, section, scanner location, and on-time/late status badges.
   - **Activity Highlights**: Verification tracking for muster inspection, simulator practicals, and laboratory check-ins.

5. **Hardware USB/Bluetooth HID Barcode Scanner Integration**:
   - Global keystroke listener (`useBarcodeScanner`) with inter-key interval detection (< 50ms default) and `Enter` carriage return terminator.
   - Acoustic Web Audio API feedback synthesizer with success, warning, and error tones.
   - Interactive **Scanner Station Modal** with sample cadet badge simulators and manual reader focus target.
   - Duplicate scan protection with cooldown and unknown barcode rejection.
   - Polite `aria-live` region for screen reader feedback.

6. **TanStack Table Roster & Safe CSV Export**:
   - High-performance data grid with multi-column sorting, instant search filter, status toggles, pagination, and one-click CSV export with UTF-8 BOM and formula injection protection.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript, Cache Components)
- **Styling**: Tailwind CSS v4
- **Data Tables**: TanStack Table (React Table v8)
- **Icons**: Lucide React
- **Audio Feedback**: Native Web Audio API Synthesizer

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run ESLint
npm run lint

# Build for production
npm run build
```

The application runs locally at `http://localhost:3000`.
