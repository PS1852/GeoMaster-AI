export class Home {
    constructor(containerId, onSelectMode) {
        this.container = document.getElementById(containerId);
        this.onSelectMode = onSelectMode;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="glass-card" style="width: 100%; height: 100%; padding: 2rem; display: flex; flex-direction: column; justify-content: center;">
                <h1 style="text-align: center; margin-bottom: 3rem; font-size: 3rem; text-shadow: 0 0 20px rgba(34, 211, 238, 0.4);">
                    SELECT PROTOCOL
                </h1>
                
                <div class="mode-selector">
                    <div class="glass-card mode-card" data-mode="oracle">
                        <i class='bx bx-brain mode-icon'></i>
                        <h3>The Oracle's Shadow</h3>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-secondary);">AI-Generated Cryptic Hints</p>
                    </div>

                    <div class="glass-card mode-card" data-mode="flag">
                        <i class='bx bx-flag mode-icon'></i>
                        <h3>Flag Vision</h3>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-secondary);">High-Speed Identification</p>
                    </div>

                    <div class="glass-card mode-card" data-mode="currency">
                        <i class='bx bx-coin-stack mode-icon'></i>
                        <h3>Currency Pulse</h3>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-secondary);">Economic Data Analysis</p>
                    </div>

                    <div class="glass-card mode-card" data-mode="capital">
                        <i class='bx bxs-landmark mode-icon'></i>
                        <h3>Capital Bridge</h3>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-secondary);">Urban Center Matching</p>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.onSelectMode(mode);
            });
        });
    }
}
