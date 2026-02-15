/* ============================================================
   GEOMASTER AI - MONOLITHIC CORE
   All modules consolidated to prevent MIME/Path issues on local servers.
   ============================================================ */

// 1. STATE MANAGEMENT (GameEngine)
class GameEngine {
    constructor() {
        this.state = {
            score: 0, streak: 0, xp: 0, lives: 3, level: 1,
            currentMode: null, isGameOver: false
        };
        this.listeners = [];
    }
    subscribe(listener) { this.listeners.push(listener); }
    notify() { this.listeners.forEach(l => l(this.state)); }
    resetGame() {
        this.state.score = 0; this.state.streak = 0; this.state.lives = 3; this.state.isGameOver = false;
        this.notify();
    }
    setMode(mode) { this.state.currentMode = mode; this.resetGame(); this.notify(); }
    registerHit(xpGained = 100) {
        this.state.score += (100 + (this.state.streak * 10));
        this.state.streak += 1;
        this.state.xp += xpGained;
        if (this.state.xp >= (this.state.level * 1000)) this.state.level++;
        this.notify();
        return true;
    }
    registerMiss() {
        this.state.lives -= 1; this.state.streak = 0;
        if (this.state.lives <= 0) this.state.isGameOver = true;
        this.notify();
        return false;
    }
}
const gameEngine = new GameEngine();

// 2. DATA SERVICE (CountryService)
const COUNTRY_API = 'https://restcountries.com/v3.1/all';
const FALLBACK_DATA = [
    { name: { common: "France" }, cca3: "FRA", capital: ["Paris"], flags: { svg: "https://flagcdn.com/fr.svg" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, independent: true, region: "Europe", population: 67391582 },
    { name: { common: "Japan" }, cca3: "JPN", capital: ["Tokyo"], flags: { svg: "https://flagcdn.com/jp.svg" }, currencies: { JPY: { name: "Japanese yen", symbol: "¥" } }, independent: true, region: "Asia", population: 125836021 },
    { name: { common: "Brazil" }, cca3: "BRA", capital: ["Brasília"], flags: { svg: "https://flagcdn.com/br.svg" }, currencies: { BRL: { name: "Brazilian real", symbol: "R$" } }, independent: true, region: "Americas", population: 213993441 },
    { name: { common: "United States" }, cca3: "USA", capital: ["Washington, D.C."], flags: { svg: "https://flagcdn.com/us.svg" }, currencies: { USD: { name: "United States dollar", symbol: "$" } }, independent: true, region: "Americas", population: 331449281 },
    { name: { common: "Australia" }, cca3: "AUS", capital: ["Canberra"], flags: { svg: "https://flagcdn.com/au.svg" }, currencies: { AUD: { name: "Australian dollar", symbol: "$" } }, independent: true, region: "Oceania", population: 25687041 },
    { name: { common: "India" }, cca3: "IND", capital: ["New Delhi"], flags: { svg: "https://flagcdn.com/in.svg" }, currencies: { INR: { name: "Indian rupee", symbol: "₹" } }, independent: true, region: "Asia", population: 1380004385 },
    { name: { common: "Egypt" }, cca3: "EGY", capital: ["Cairo"], flags: { svg: "https://flagcdn.com/eg.svg" }, currencies: { EGP: { name: "Egyptian pound", symbol: "£" } }, independent: true, region: "Africa", population: 102334403 }
];

class CountryService {
    constructor() { this.cache = null; }
    async init() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(COUNTRY_API, { signal: controller.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.cache = data.filter(c => c.independent && c.capital && c.currencies);
        } catch (e) {
            console.warn("Using Fallback Data");
            this.cache = FALLBACK_DATA;
        }
    }
    generateQuestionSet() {
        const shuffled = [...this.cache].sort(() => 0.5 - Math.random());
        const batch = shuffled.slice(0, 4);
        return { target: batch[0], options: [...batch].sort(() => 0.5 - Math.random()) };
    }
}
const countryService = new CountryService();

// 3. AI SERVICE
const AI_API = 'https://openrouter.ai/api/v1/chat/completions';
const AI_KEY = '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';

class AIService {
    async getHints(country) {
        try {
            const res = await fetch(AI_API, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${AI_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.1-8b-instruct:free',
                    messages: [{ role: 'user', content: `Provide 3 distinct hints for ${country}. Format: 1. [Hint] 2. [Hint] 3. [Hint]. No country name.` }]
                })
            });
            const data = await res.json();
            return data.choices[0].message.content.split(/\d\.\s+/).filter(s => s.trim().length > 5).slice(0, 3);
        } catch (e) {
            return [`Region: ${country.region}`, `Population: High`, `Climate: Varied`];
        }
    }
}
const aiService = new AIService();

// 4. UI COMPONENTS (QuizInterface, Home, Modes)
class QuizInterface {
    constructor(container) {
        this.container = container;
        this.render();
    }
    render() {
        this.container.innerHTML = `
            <div class="game-area">
                <header class="quiz-header">
                    <div class="stat-item">
                        <span class="stat-label">Lives</span>
                        <div class="stat-value" id="lives-val">3</div>
                    </div>
                    <div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>
                    <div class="stat-item">
                        <span class="stat-label">Score</span>
                        <div class="stat-value" id="score-val">0</div>
                    </div>
                </header>
                <main class="quiz-content">
                    <div class="question-prompt" id="q-prompt">...</div>
                    <div id="q-main" class="main-subject"></div>
                    <div id="q-media"></div>
                    <div class="options-grid" id="q-options"></div>
                </main>
            </div>`;
    }
    update(score, lives) {
        document.getElementById('score-val').textContent = score;
        document.getElementById('lives-val').textContent = lives;
    }
}

// 5. BOOTSTRAP & NAVIGATION
function updateSidebar() {
    const scoreEl = document.getElementById('side-score');
    const lvlEl = document.getElementById('lvl');
    if (scoreEl) scoreEl.textContent = gameEngine.state.score;
    if (lvlEl) lvlEl.textContent = `Lvl ${gameEngine.state.level}`;
}

async function startGame(mode) {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `<div class="loader-text">Initializing Protocol...</div>`;

    gameEngine.setMode(mode);
    const ui = new QuizInterface(gameContent);

    // Subscribe to updates for this game
    gameEngine.subscribe(() => {
        ui.update(gameEngine.state.score, gameEngine.state.lives);
        updateSidebar();
    });

    const nextRound = async () => {
        if (gameEngine.state.isGameOver) return showGameOver();

        const { target, options } = countryService.generateQuestionSet();
        let prompt = "", main = "", media = "";

        const optionsGrid = document.getElementById('q-options');
        if (!optionsGrid) return; // Guard
        optionsGrid.innerHTML = '';

        if (mode === 'oracle') {
            prompt = "The Oracle reveals...";
            document.getElementById('q-main').innerHTML = `<div class="ai-status visible"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
            const hints = await aiService.getHints(target.name.common);
            main = `<div class="hints-box">${hints.map(h => `<div class="hint-item">${h}</div>`).join('')}</div>`;
        } else if (mode === 'flag') {
            prompt = "Identify this Territory";
            media = `<img src="${target.flags.svg}" class="flag-image">`;
        } else if (mode === 'capital') {
            prompt = "Nation for this Capital";
            main = target.capital ? target.capital[0] : "Unknown";
        } else if (mode === 'currency') {
            prompt = "Match the Economy";
            const c = target.currencies ? Object.values(target.currencies)[0] : { name: "Unknown", symbol: "?" };
            main = `${c.name} (${c.symbol})`;
        }

        document.getElementById('q-prompt').textContent = prompt;
        document.getElementById('q-main').innerHTML = main;
        document.getElementById('q-media').innerHTML = media;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'glass-card option-btn';
            btn.textContent = opt.name.common;
            btn.onclick = () => {
                const isCorrect = opt.cca3 === target.cca3;
                if (isCorrect) {
                    gameEngine.registerHit();
                    btn.classList.add('correct');
                } else {
                    gameEngine.registerMiss();
                    btn.classList.add('wrong');
                    Array.from(document.querySelectorAll('.option-btn')).find(b => b.textContent === target.name.common)?.classList.add('correct');
                }
                setTimeout(nextRound, 1500);
            };
            optionsGrid.appendChild(btn);
        });

        ui.update(gameEngine.state.score, gameEngine.state.lives);
    };

    const showGameOver = () => {
        gameContent.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center;">
                <h1 style="color: var(--accent-red); margin-bottom: 1rem;">MISSION FAILED</h1>
                <p style="font-size: 1.5rem;">Final score: <span class="text-cyan">${gameEngine.state.score}</span></p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 2rem;">REINITIALIZE SYSTEM</button>
            </div>`;
    };

    nextRound();
}

function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="main-container">
            <aside class="glass-card sidebar">
                <div class="user-profile">
                    <div class="avatar">GM</div>
                    <div>
                        <h3>Agent</h3>
                        <span id="lvl">Lvl 1</span>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Score</div>
                        <div id="side-score" class="stat-value">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">High Score</div>
                        <div class="stat-value text-cyan">---</div>
                    </div>
                </div>
                <div style="margin-top: auto; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">
                    GEO-MASTER AI v1.0.0
                </div>
            </aside>
            <div id="game-content" class="glass-card game-area">
                <h2 style="text-align: center; margin-top: 3rem; letter-spacing: 4px; color: var(--text-secondary);">SELECT PROTOCOL</h2>
                <div class="mode-selector">
                    <div class="glass-card mode-card" onclick="startProtocol('oracle')"><i class='bx bx-brain mode-icon'></i><h3>Oracle</h3></div>
                    <div class="glass-card mode-card" onclick="startProtocol('flag')"><i class='bx bx-flag mode-icon'></i><h3>Flags</h3></div>
                    <div class="glass-card mode-card" onclick="startProtocol('capital')"><i class='bx bxs-landmark mode-icon'></i><h3>Capitals</h3></div>
                    <div class="glass-card mode-card" onclick="startProtocol('currency')"><i class='bx bx-coin-stack mode-icon'></i><h3>Currency</h3></div>
                </div>
            </div>
        </div>`;

    window.startProtocol = (m) => startGame(m);
    updateSidebar();
}

// Entry Point
(async () => {
    try {
        console.log("System initialization...");
        await countryService.init();
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
                renderHome();
            }, 500);
        } else {
            renderHome();
        }
    } catch (err) {
        console.error("FATAL:", err);
        document.body.innerHTML = `<div style="color:red; padding:2rem;">Fatal System Error: ${err.message}</div>`;
    }
})();
