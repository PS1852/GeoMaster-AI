import { gameEngine } from '../core/GameEngine.js';
import { countryService } from '../services/CountryService.js';
import { aiService } from '../services/AIService.js';
import { QuizInterface } from './QuizInterface.js';

export class OracleMode {
    constructor(containerId) {
        this.quizUI = new QuizInterface(containerId);
        this.currentCountry = null;
        this.hintTimer = null;
        this.hints = [];
        this.activeHintIndex = 0;

        // Listen to game engine updates
        gameEngine.subscribe(state => {
            if (state.isGameOver) {
                this.endGame();
            } else {
                this.updateUI(state);
            }
        });

        this.startRound();
    }

    async startRound() {
        this.quizUI.clear();

        // Get new country
        const { target, options } = countryService.generateQuestionSet('oracle');
        this.currentCountry = target;

        this.quizUI.setQuestion(
            "The Oracle is analyzing satellite data...",
            `<div class="ai-status visible">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
             </div>`,
            ''
        );

        // Fetch AI Hints
        try {
            this.hints = await aiService.getHintsForCountry(target.name.common);

            if (!this.hints || this.hints.length === 0) {
                // Fallback if AI fails
                this.hints = [
                    `Region: ${target.region}`,
                    `Subregion: ${target.subregion || 'Unknown'}`,
                    `Population: approx ${(target.population / 1000000).toFixed(1)} million`
                ];
            }

            this.activeHintIndex = 0;
            this.displayHints();

            // Setup Options
            this.quizUI.setOptions(options, (selected, btn) => this.handleGuess(selected, btn));

            // Start Timer (30s)
            this.quizUI.startTimer(30, () => this.handleTimeout());

        } catch (error) {
            console.error('Oracle Mode Error:', error);
            this.quizUI.setQuestion("Error connecting to Oracle network.", "ABORT");
        }
    }

    displayHints() {
        // Clear previous content but keep structure
        this.quizUI.mainSubject.innerHTML = `
            <div class="oracle-container">
                <div class="hints-box" id="hints-box">
                    <!-- Hints injected here -->
                </div>
            </div>
        `;

        const hintsBox = document.getElementById('hints-box');

        // Timer to reveal hints
        this.hintInterval = setInterval(() => {
            if (this.activeHintIndex >= this.hints.length) {
                clearInterval(this.hintInterval);
                return;
            }

            const hintEl = document.createElement('div');
            hintEl.className = 'hint-item';
            hintEl.textContent = this.hints[this.activeHintIndex];
            hintsBox.appendChild(hintEl);

            this.activeHintIndex++;
        }, 5000); // New hint every 5 seconds

        // Show first hint immediately
        const firstHint = document.createElement('div');
        firstHint.className = 'hint-item';
        firstHint.textContent = this.hints[0];
        hintsBox.appendChild(firstHint);
        this.activeHintIndex = 1;
    }

    handleGuess(selectedCountry, btnElement) {
        this.stopRound();

        const isCorrect = selectedCountry.cca3 === this.currentCountry.cca3;

        if (isCorrect) {
            gameEngine.registerHit();
            btnElement.classList.add('correct');
            // Show full flag/details on success
            this.quizUI.mainSubject.innerHTML += `
                <div style="margin-top: 1rem; text-align: center;">
                    <img src="${this.currentCountry.flags.svg}" style="width: 100px; border-radius: 8px;">
                    <h3>${this.currentCountry.name.common}</h3>
                </div>
            `;
        } else {
            gameEngine.registerMiss();
            btnElement.classList.add('wrong');
            // Highlight correct answer
            this.quizUI.showFeedback(false, this.currentCountry.cca3);
        }

        setTimeout(() => {
            if (!gameEngine.state.isGameOver) {
                this.startRound();
            }
        }, 2000);
    }

    handleTimeout() {
        this.stopRound();
        gameEngine.registerMiss();
        this.quizUI.showFeedback(false, this.currentCountry.cca3);
        setTimeout(() => {
            if (!gameEngine.state.isGameOver) {
                this.startRound();
            }
        }, 2000);
    }

    stopRound() {
        clearInterval(this.hintInterval);
        this.quizUI.stopTimer();
        // Disable all buttons
        const storedBtns = document.querySelectorAll('.option-btn');
        storedBtns.forEach(b => b.disabled = true);
    }

    updateUI(state) {
        this.quizUI.updateStats(state.score, state.lives);
    }

    endGame() {
        this.quizUI.container.innerHTML = `
            <div class="glass-card" style="padding: 3rem; text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-red);">GAME OVER</h1>
                <p style="font-size: 1.5rem; margin-bottom: 2rem;">Final Score: <span class="text-cyan">${gameEngine.state.score}</span></p>
                <button id="restart-btn" class="btn-primary">Reinitialize System</button>
            </div>
        `;
        document.getElementById('restart-btn').onclick = () => {
            gameEngine.resetGame();
            this.startRound();
        };
    }
}
