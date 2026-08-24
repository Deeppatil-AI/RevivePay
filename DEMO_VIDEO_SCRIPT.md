# 🎬 RevivePay 5-Minute Video Recording Guide & Cue Sheet

This guide provides the exact second-by-second screen actions, UI clicks, and vocal cues to record your winning 5-minute hackathon pitch video.

---

## 📋 Pre-Flight Checklist Before Hitting Record
- [ ] Backend server running: `npm run server` (`http://localhost:5000`)
- [ ] Frontend dev server running: `npm run dev` (`http://localhost:5173`)
- [ ] Browser window open at `http://localhost:5173` (Full screen, 100% zoom)
- [ ] Smartphone with GPay/PhonePe handy to scan the dynamic QR code live
- [ ] Recording software ready: **OBS Studio**, **Loom**, or **Windows Screen Recorder** (`Win + Alt + R`)

---

## ⏱️ Visual Cue Sheet (0:00 – 5:00)

| Timestamp | Visual Action (What to Click / Show) | Key Vocal Message / Talking Point |
| :--- | :--- | :--- |
| **00:00 – 00:45** | **Landing Page** (`/`): Scroll through hero section, rotating headlines, and proof badges. | Problem Statement: 18–35% ARR lost to midnight bank CBS locks (`NPCI_U30`), ₹45 bounce fines, delayed B2B receivables, and chargebacks. Introduce RevivePay Sentinel. |
| **00:45 – 01:45** | Click **'Launch Live Sentinel Demo'**: Show **Subscriptions Batch** with Chaos Monkey active. Click **WhatsApp** icon on transaction `pay_ott_891`. Show **Live Dynamic UPI QR Code**. | Track 03: CBS Outage Interception, autonomous morning reschedule (08:15 AM IST), Vernacular recovery in 5 Indian languages, and live scannable UPI QR code. |
| **01:45 – 02:45** | Switch tab to **'DisputeShield'**: Click on claim `disp_chargeback_881`. Preview the 4-point evidentiary dossier. Click **'Export as PDF'** (shows downloaded PDF). | Track 02: Ingests 3DS 2.0 Auth RRNs, signed delivery OTPs, courier waybills, and IP fingerprints. 91.2% predicted win rate with instant arbitration-grade PDF export. |
| **02:45 – 03:45** | Switch tab to **'B2B Receivables & PTP'**: Show 18% GST matching & PTP date. Switch tab to **'ROI & Cash Forecast'**: Show **Double-Entry Ledger Integrity** and Recharts curve. | Track 04: B2B invoice acceleration, 8-state Payment State Machine, SHA-256 Idempotency, and mathematically balanced Double-Entry Ledger (\(\sum \text{Dr} = \sum \text{Cr}\)). |
| **03:45 – 04:30** | Click **'Agentic UAP'** in the top navbar: Click **'Negotiate Autonomous Deal'** (shows M2M negotiation, confetti, and token generation). | Track 01: Machine-to-Machine autonomous procurement negotiation under NPCI UAP and x402 protocols with bounded financial guardrails. |
| **04:30 – 05:00** | Return to **Batch Runner** or **Landing Page**: Show 50/50 passing Vitest tests in terminal drawer or summary card. | Summary: 50 unit tests, V2 Fraud Feature Extraction, Background Queue, RBAC security, and production-ready Express+SQLite architecture. |

---

## 📹 Video Embedding in Repository
Once your video is recorded and uploaded to YouTube or Loom, update the link in `README.md` and `docs/DEMO_VIDEO.md`:

```markdown
## 🎥 5-Minute Video Pitch Walkthrough
[![Watch the Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
```
