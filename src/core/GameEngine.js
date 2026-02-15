export class GameEngine {
    constructor() {
        this.state = {
            score: 0,
            streak: 0,
            xp: 0,
            lives: 3,
            level: 1,
            currentMode: null, // 'oracle', 'flag', 'currency', 'capital'
            isGameOver: false,
            history: [] // track past games
        };

        this.listeners = [];
    }

    // Pub/Sub for UI updates
    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    resetGame() {
        this.state.score = 0;
        this.state.streak = 0;
        this.state.lives = 3;
        this.state.isGameOver = false;
        this.notify();
    }

    setMode(mode) {
        this.state.currentMode = mode;
        this.resetGame();
        console.log(`Mode set to: ${mode}`);
        this.notify();
    }

    registerHit(xpGained = 100) {
        this.state.score += (100 + (this.state.streak * 10)); // Bonus for streaks
        this.state.streak += 1;
        this.state.xp += xpGained;
        
        // Level up logic
        const nextLevel = this.state.level * 1000;
        if (this.state.xp >= nextLevel) {
            this.state.level++;
            // Could trigger a level up event/animation
        }

        this.notify();
        return { correct: true, score: this.state.score, streak: this.state.streak };
    }

    registerMiss() {
        this.state.lives -= 1;
        this.state.streak = 0;
        
        if (this.state.lives <= 0) {
            this.state.isGameOver = true;
        }

        this.notify();
        return { correct: false, lives: this.state.lives, gameOver: this.state.isGameOver };
    }

    getState() {
        return { ...this.state };
    }
}

export const gameEngine = new GameEngine();
