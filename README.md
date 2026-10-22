# ChronoAttendis — Attendance Tracking System
### Official Attendance Tracking System for John B. Lacson Colleges Foundation – Bacolod (JBLCF-Bacolod)

**ChronoAttendis** is a mission-critical, institutional attendance monitoring dashboard engineered specifically for faculty, regimental officers, and administrators of JBLCF-Bacolod. It provides real-time gate turnstile monitoring, biometric and barcode card swipe logging, academic section analytics, and drill muster tracking.

---

## 🏛️ Visual Identity & Design System

- **Institutional Deep Blue** (`#0A1C33` / `#0E294B`): Maritime authority and corporate institutional foundation.
- **Academic Gold** (`#C99313` / `#DEB033`): Academic excellence and regimental insignia accents.
- **Crisp High-Contrast White** (`#FFFFFF` on `#F8FAFC`): Strict readability for faculty operational workflows.
- **Zero-Gradient Rule**: Prohibits generic AI gradients (purple-to-blue or teal-to-purple), utilizing solid, mathematically proportioned 8pt cards and borders.
- **Typographic System**: Tabular numeric fonts (`tabular-nums font-mono`) for precision counts, timestamps, and barcode strings.

---

## ⚡ Core Features (Phase 1 Rollout)

1. **Collapsible Institutional Sidebar**:
   - Navigation across `Dashboard`, `Teacher & Faculty`, `Students & Cadets`, `Notice Board`, and `Edit Account`.
   - Real-time Hardware Scanner HID connection status indicator.
   - Dean & Administrator regimental profile block.

2. **Top Metrics Bar with Period Switching**:
   - **Total Enrolled** (2,840 active cadets & students).
   - **Present Today / Turnout** (2,688 / 94.6% confirmed check-ins with comparative day-over-day delta).
   - **Boys Attendance** (1,820 / 95.1% maritime regiment turnout).
   - **Girls Attendance** (868 / 93.7% academic division turnout).
   - **Total Absences** (152 unexcused/excused breakdown & late arrivals).
   - Instant tab-switching between **Today's Attendance** and **Previous Day's Attendance**.

3. **Analytics & Trends**:
   - **Attendance Overview Chart**: Hourly velocity curve (06:00 AM – 05:00 PM) tracking gate check-ins and departures with hover tooltips and peak muster identification.
   - **Attendance by Class / Department Bar Chart**: Headcount present vs enrolled capacity across sections (`BSMT 1-Alpha`, `BSMarE 2-Charlie`, `BSHM 2-A`, `SHS 11-Maritime A`) with interactive department filter pills.

4. **Calendar & Live Activity Stream**:
   - **Academic Calendar Grid**: Interactive October 2026 calendar highlighting Flag Ceremonies, Shipboard Safety Drills, Naval Inspections, and Examination milestones.
   - **Live "Today's Activities" Stream**: Real-time swipe logs detailing cadet name, student ID, section, gate turnstile location, and on-time/late status badges.
   - **Institutional Activity Gallery**: Verification progress tracking for Morning Muster, Bridge Simulator practicals, and Hospitality laboratory check-ins.

5. **Hardware USB/Bluetooth HID Barcode Scanner Integration**:
   - Global keystroke listener (`useBarcodeScanner`) with rapid inter-key interval detection (< 50ms) and `Enter` carriage return terminator.
   - Acoustic Web Audio API feedback synthesizer with configurable 880Hz/1320Hz institutional chime.
   - Interactive **Scanner Station Modal** with sample cadet badge simulators (`Cadet Joshua Dela Cruz`, `Cadet Maria Teresa Alcantara`, etc.) and manual reader focus target.
   - Scanned events instantly trigger an institutional toast banner, update the Live Activity Stream, and recalculate attendance metrics.

6. **TanStack Table (React Table v8) Roster**:
   - High-performance data grid with multi-column sorting, instant search filter, status toggles, pagination, and one-click CSV export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript)
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

# Build for production
npm run build
```

The application runs locally at `http://localhost:3000`.
