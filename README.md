# Neuropace-AI

> Real-Time Neuro-Somatic Bio-Pacing & Autonomic Regulation Dashboard
---
## The Problem
**Individuals with neuro-somatic conditions, autonomic dysfunction, or cognitive fatigue frequently experience sudden physiological crashes due to improper pacing. Providing clinically guided interventions when acute cognitive overwhelm or autonomic strain occurs.**

## The Solution & Results
NeuroPace AI bridges the gap between passive tracking and active recovery. It combines health metrics engine with an interactive somatic pacing suite.

* Predictive AI Engine: Analyzes daily sleep, screen time, hydration, and symptom metrics via Google Gemini API

* Interactive Bio-Pacing Suite: Delivers step-by-step vagus nerve resets, oculomotor shifts, and diaphragmatic breathing exercises with live visual cues.

* Results: Users reduce sensory fatigue, lower autonomic hyperarousal, and maintain sustainable daily energy reserves through structured clinical feedback.

## Tech Stack:

* HTML, CSS3 (Custom Dark/Light Themes), JavaScript
* Google Gemini API (gemini-3.6-flash),
* Chart.js

---

## How to Run on Your System

### 1. Prerequisites

* A Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/).

### 2. Clone the Repository

```bash
git clone https://github.com/MuhammadHuzaifaG/Neuropace-AI.git
cd NeuroPace-AI

```

### 3. Insert Your Gemini API Key

Open `app.js` in your code editor, locate the configuration variable near the top, and add your API key:

```javascript
// app.js
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

```

### 4. Run the Application

Launch `index.html` using a local web server (such as VS Code's **Live Server** extension) or via python:

```bash
python -m http.server 8000

```

Navigate to `http://localhost:8000` in your web browser.

---

## 📖 How to Use

1. **Log Health Metrics:** Enter your daily symptom levels, sleep quality, hydration, and screen time in the tracker section.
2. **Generate AI Analysis:** Click **"Analyze & Get Brain Prediction"** to receive instant clinical guidance.
3. **Launch Bio-Pacing:** Select a neuro-somatic protocol (e.g., *Vagus Nerve Reset* or *Oculomotor Shift*) to follow live visual cues and restore balance.
