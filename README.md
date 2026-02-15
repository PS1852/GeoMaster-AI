# GeoMaster AI v2.0

A luxury, high-performance Geography Quiz Single Page Application with AI-powered hints, professional "Cyber-Slate" design, and comprehensive country data.

![GeoMaster AI](https://img.shields.io/badge/GeoMaster-AI%20v2.0-22d3ee?style=for-the-badge&labelColor=020617)

## 🌍 Features

### Game Modes
- **🚩 Flag Vision** — Identify countries from their HD flags
- **🏛️ Capital Bridge** — Match capital cities to their nations
- **⛓️ Neighbor Nexus** — Guess the country based on its bordering neighbors
- **🧠 AI Oracle** — Guess countries from AI-generated cryptic hints
- **🤖 AI Sentinel** — Interrogate an AI about a hidden country to identify it

### Technical Highlights
- **🔐 Agent Auth System** — Multi-profile support via LocalStorage key pairing
- **197 Countries** — Data sourced from [restcountries.com](https://restcountries.com)
- **No Question Repetition** — localStorage-powered history tracking per mode
- **50-Country Offline Fallback** — Enhanced with full border data for offline play
- **AI Integration** — OpenRouter API support for hints and chat
- **XP & Leveling System** — Persistent progression with profile-specific saves
- **Mobile-First Responsive** — Off-canvas sidebar, fixed headers, touch-optimized
- **Zero Build Step** — Pure HTML/CSS/JS, deployable anywhere

### Design System: "Cyber-Slate"
- Deep-space background (#020617)
- Glassmorphic cards with backdrop-filter blur
- Neon Cyan (#22d3ee) accent with purple AI highlights
- Outfit font (Google Fonts)
- Shimmer hover effects on option buttons
- Smooth CSS animations for hints, answers, and transitions
- SVG globe logo with pulse animation

## 🚀 How to Run

### Option 1: Python (Recommended)
```bash
cd GeoQuiz
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000)

### Option 2: VS Code Live Server
1. Install the "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Node.js
```bash
npx serve .
```

### Option 4: GitHub Pages
Push this folder to a GitHub repository and enable Pages from Settings. The app works with zero configuration.

## 📁 File Structure
```
GeoQuiz/
├── index.html      # Main HTML with all views (splash, home, quiz, oracle, gameover)
├── style.css       # Complete "Cyber-Slate" design system (responsive)
├── app.js          # Monolithic application core:
│                   #   - GameEngine (state, XP, lives, streaks)
│                   #   - CountryService (API fetch + 50-country fallback)
│                   #   - AIService (OpenRouter/Llama 3.1 hints)
│                   #   - Timer, Quiz, Oracle controllers
│                   #   - localStorage persistence
│                   #   - View management & event binding
└── README.md       # This file
```

## 🔧 API Configuration

### Country Data
- **Source:** `https://restcountries.com/v3.1/all`
- **Fallback:** 50 hardcoded countries with complete metadata

### AI Oracle
- **Provider:** OpenRouter
- **Model:** `meta-llama/llama-3.1-8b-instruct:free`
- **Prompt:** Generates 3 hints (geography, culture, history) without naming the country
- **Fallback:** Region/population/currency-based local hints if API fails

## 📝 License
MIT — Free to use, modify, and deploy.
