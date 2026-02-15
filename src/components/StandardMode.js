import { gameEngine } from '../core/GameEngine.js';
import { countryService } from '../services/CountryService.js';
import { QuizInterface } from './QuizInterface.js';

export class StandardMode {
    constructor(containerId, type) {
        this.quizUI = new QuizInterface(containerId);
        this.type = type; // 'flag', 'capital', 'currency'
        this.currentCountry = null;

        // Subscribe to engine
        gameEngine.subscribe(state => {
            if (state.isGameOver) {
                this.endGame();
            } else {
                this.quizUI.updateStats(state.score, state.lives);
            }
        });

        this.startRound();
    }

    startRound() {
        this.quizUI.clear();

        const { target, options } = countryService.generateQuestionSet(this.type);
        this.currentCountry = target;

        let prompt = '';
        let mainContent = '';
        let mediaContent = '';

        switch (this.type) {
            case 'flag':
                prompt = "Identify the Territory associated with this Flag";
                mediaContent = `<img src="${target.flags.svg}" class="flag-image" alt="Flag">`;
                break;
            case 'capital':
                prompt = "Locate the Nation for this Capital City";
                mainContent = target.capital ? target.capital[0] : 'Unknown';
                break;
            case 'currency':
                prompt = "Match the Currency to the Economy";
                const keys = Object.keys(target.currencies || {});
                const currency = keys.length > 0 ? target.currencies[keys[0]] : { name: 'Unknown', symbol: '?' };
                mainContent = `${currency.name} (${currency.symbol})`;
                // 3D Coin Icon could be added here
                mediaContent = `<div style="font-size: 4rem; color: var(--accent-amber); margin: 1rem 0;"><i class='bx bxs-coin-stack'></i></div>`;
                break;
        }

        this.quizUI.setQuestion(prompt, mainContent, mediaContent);
        this.quizUI.setOptions(options, (selected, btn) => this.handleGuess(selected, btn));

        // Faster timer for standard modes
        this.quizUI.startTimer(15, () => this.handleTimeout());
    }

    handleGuess(selectedCountry, btnElement) {
        this.quizUI.stopTimer();

        const isCorrect = selectedCountry.cca3 === this.currentCountry.cca3;

        if (isCorrect) {
            gameEngine.registerHit(50); // Less XP for standard
            btnElement.classList.add('correct');
        } else {
            gameEngine.registerMiss();
            btnElement.classList.add('wrong');
            this.quizUI.showFeedback(false, this.currentCountry.cca3);
        }

        setTimeout(() => {
            if (!gameEngine.state.isGameOver) {
                this.startRound();
            }
        }, 1500);
    }

    handleTimeout() {
        this.quizUI.stopTimer();
        gameEngine.registerMiss();
        this.quizUI.showFeedback(false, this.currentCountry.cca3);
        setTimeout(() => {
            if (!gameEngine.state.isGameOver) {
                this.startRound();
            }
        }, 1500);
    }

    endGame() {
        // Reuse same game over screen or customizable?
        // Basic restart for now
        this.quizUI.container.innerHTML = `
             <div class="glass-card" style="padding: 3rem; text-align: center; max-width: 500px; margin: 0 auto;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-red);">MISSION FAILED</h1>
                <p style="font-size: 1.5rem; margin-bottom: 2rem;">Final Data Points: <span class="text-cyan">${gameEngine.state.score}</span></p>
                <button id="restart-std" class="btn-primary">Retry Protocol</button>
            </div>
        `;
        document.getElementById('restart-std').onclick = () => {
            gameEngine.resetGame();
            this.startRound();
        };
    }
}
