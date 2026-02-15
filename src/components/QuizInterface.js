export class QuizInterface {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error('Container not found');

        // Cache DOM elements
        this.timerBar = null;
        this.scoreDisplay = null;
        this.livesDisplay = null;
        this.questionArea = null;
        this.optionsArea = null;
        this.feedbackOverlay = null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-area">
                <header class="quiz-header">
                    <div class="stat-item lives-display">
                        <span class="stat-label">Lives</span>
                        <div class="stat-value" id="lives-val">3</div>
                    </div>
                    
                    <div class="timer-bar">
                        <div class="timer-fill" id="timer-fill"></div>
                    </div>

                    <div class="stat-item score-display">
                        <span class="stat-label">Score</span>
                        <div class="stat-value" id="score-val">0</div>
                    </div>
                </header>

                <main class="quiz-content" id="quiz-content">
                    <div class="question-prompt" id="question-prompt">Decode the location...</div>
                    <div id="main-subject-area" class="main-subject"></div>
                    
                    <!-- Area for hints or images -->
                    <div id="media-area"></div>

                    <div class="options-grid" id="options-grid">
                        <!-- Options injected here -->
                    </div>
                </main>
            </div>
        `;

        this.timerFill = document.getElementById('timer-fill');
        this.scoreVal = document.getElementById('score-val');
        this.livesVal = document.getElementById('lives-val');
        this.mainSubject = document.getElementById('main-subject-area');
        this.mediaArea = document.getElementById('media-area');
        this.optionsGrid = document.getElementById('options-grid');
        this.promptText = document.getElementById('question-prompt');
    }

    updateStats(score, lives) {
        if (this.scoreVal) this.scoreVal.textContent = score;
        if (this.livesVal) this.livesVal.textContent = lives;
    }

    setQuestion(prompt, mainContent, mediaContent = '') {
        this.promptText.textContent = prompt;
        this.mainSubject.innerHTML = mainContent;
        this.mediaArea.innerHTML = mediaContent;
    }

    setOptions(options, onSelectCallback) {
        this.optionsGrid.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'glass-card option-btn';
            btn.textContent = opt.name.common; // Assuming standard restcountries object
            btn.dataset.id = opt.cca3;

            btn.onclick = () => onSelectCallback(opt, btn);
            this.optionsGrid.appendChild(btn);
        });
    }

    startTimer(duration, onTimeUp) {
        // Reset timer visual
        this.timerFill.style.transition = 'none';
        this.timerFill.style.width = '100%';
        this.timerFill.offsetHeight; // Trigger reflow

        // Start animation
        this.timerFill.style.transition = `width ${duration}s linear`;
        this.timerFill.style.width = '0%';

        this.timerTimeout = setTimeout(() => {
            if (onTimeUp) onTimeUp();
        }, duration * 1000);
    }

    stopTimer() {
        clearTimeout(this.timerTimeout);
        const currentWidth = this.timerFill.getBoundingClientRect().width;
        const parentWidth = this.timerFill.parentElement.getBoundingClientRect().width;

        this.timerFill.style.transition = 'none';
        this.timerFill.style.width = `${(currentWidth / parentWidth) * 100}%`;
    }

    showFeedback(isCorrect, correctId = null) {
        // Highlight logic
        const buttons = this.optionsGrid.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.id === correctId) {
                btn.classList.add('correct');
            } else if (!isCorrect && btn.classList.contains('selected')) {
                btn.classList.add('wrong');
            }
        });

        // Visual feedback (screen flash or sound could go here)
        if (!isCorrect) {
            document.body.style.boxShadow = 'inset 0 0 50px rgba(239, 68, 68, 0.5)';
            setTimeout(() => document.body.style.boxShadow = '', 500);
        }
    }

    clear() {
        this.mainSubject.innerHTML = '';
        this.mediaArea.innerHTML = '';
        this.optionsGrid.innerHTML = '';
        this.stopTimer();
    }
}
