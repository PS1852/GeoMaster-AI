import { gameEngine } from './core/GameEngine.js';
import { countryService } from './services/CountryService.js';
import { Home } from './components/Home.js';
import { OracleMode } from './components/OracleMode.js';
import { StandardMode } from './components/StandardMode.js';

const appContainer = document.getElementById('app');

async function initApp() {
    try {
        console.log("Starting Initialization...");

        // Race condition: Timeout after 5 seconds
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network Timeout: Database took too long")), 5000)
        );

        // Initialize Data
        await Promise.race([countryService.init(), timeout]);

        console.log("Initialization Complete.");

        // Remove Loader Safely
        const loader = document.getElementById('initial-loader');
        if (loader) {
            // Try GSAP, fallback to CSS
            if (window.gsap) {
                gsap.to(loader, { opacity: 0, duration: 0.5, onComplete: () => loader.remove() });
            } else {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s';
                setTimeout(() => loader.remove(), 500);
            }
        }

        renderHome();

    } catch (error) {
        console.error("Initialization Failed:", error);

        // Force remove loader if it's still there
        const loader = document.getElementById('initial-loader');
        if (loader) loader.remove();

        appContainer.innerHTML = `
            <div class="glass-card" style="padding: 2rem; color: var(--accent-red); text-align: center;">
                <h2>System Malfunction</h2>
                <p style="margin: 1rem 0; color: var(--text-secondary);">${error.message}</p>
                <button onclick="window.location.reload()" class="btn-primary" style="margin-top: 1rem;">Reboot System</button>
            </div>
        `;
    }
}

function renderHome() {
    // Clear previous view
    appContainer.innerHTML = '';

    // Create container for home
    const homeContainer = document.createElement('div');
    homeContainer.className = 'main-container';
    appContainer.appendChild(homeContainer);

    // Render SideBar (Mock for now, or real stats)
    const sidebar = document.createElement('aside');
    sidebar.className = 'glass-card sidebar';
    sidebar.innerHTML = `
        <div class="user-profile">
            <div class="avatar">GM</div>
            <div class="username">
                <h3>Agent</h3>
                <span>Level ${gameEngine.state.level}</span>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Total XP</div>
                <div class="stat-value">${gameEngine.state.xp}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">High Score</div>
                <div class="stat-value text-cyan">0</div> <!-- Persistance needed -->
            </div>
        </div>
        <div style="margin-top: auto; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">
            v1.0.0 &copy; 2026 GeoMaster AI
        </div>
    `;
    homeContainer.appendChild(sidebar);

    // Main Content Area
    const contentArea = document.createElement('div');
    contentArea.id = 'game-content';
    contentArea.className = 'glass-card game-area';
    homeContainer.appendChild(contentArea);

    // Initialize Home View inside contentArea
    new Home('game-content', (mode) => startGame(mode));
}

function startGame(mode) {
    const gameContent = document.getElementById('game-content');

    // Animate transition (optional)
    gsap.to(gameContent, {
        opacity: 0, duration: 0.3, onComplete: () => {
            gameContent.innerHTML = ''; // Clear Home
            gsap.to(gameContent, { opacity: 1, duration: 0.3 });

            // Start Mode
            gameEngine.setMode(mode);

            switch (mode) {
                case 'oracle':
                    new OracleMode('game-content');
                    break;
                case 'flag':
                    new StandardMode('game-content', 'flag'); // Using type directly
                    break;
                case 'currency':
                    new StandardMode('game-content', 'currency');
                    break;
                case 'capital':
                    new StandardMode('game-content', 'capital');
                    break;
                default:
                    console.error("Unknown mode:", mode);
                    renderHome();
            }
        }
    });
}

// Start
initApp();
