/* =============================================================
   NEXUS SFX ENGINE v1.0
   Atmospheric Sound Design for GeoMaster AI
   Pure Web Audio API — Zero external dependencies
   ============================================================= */

const NexusSFX = (() => {
    let ctx = null;
    let muted = localStorage.getItem('nexus_sfx_muted') === 'true';
    let volume = parseFloat(localStorage.getItem('nexus_sfx_volume') || '0.35');
    let ambientNode = null;
    let ambientGain = null;

    function getCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio not supported');
                return null;
            }
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function createGain(val) {
        const c = getCtx();
        if (!c) return null;
        const g = c.createGain();
        g.gain.value = val * volume;
        g.connect(c.destination);
        return g;
    }

    // ── CORRECT ANSWER: Bright ascending chime ──
    function correct() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Two-note ascending major chord
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.25 * volume, now + i * 0.08 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.4);
        });

        // Sparkle overlay
        const sparkle = c.createOscillator();
        const sGain = c.createGain();
        sparkle.type = 'triangle';
        sparkle.frequency.value = 1568;
        sGain.gain.setValueAtTime(0, now + 0.15);
        sGain.gain.linearRampToValueAtTime(0.08 * volume, now + 0.2);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        sparkle.connect(sGain);
        sGain.connect(c.destination);
        sparkle.start(now + 0.15);
        sparkle.stop(now + 0.55);
    }

    // ── WRONG ANSWER: Low distorted buzz ──
    function wrong() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Dissonant low tone
        [150, 155].forEach(freq => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2 * volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        });

        // Static noise burst
        const bufferSize = c.sampleRate * 0.15;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        const nGain = c.createGain();
        nGain.gain.setValueAtTime(0.12 * volume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        noise.connect(nGain);
        nGain.connect(c.destination);
        noise.start(now);
    }

    // ── HOVER: Soft high-freq blip ──
    function hover() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = 2200 + Math.random() * 400;
        gain.gain.setValueAtTime(0.04 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // ── CLICK: Crisp digital tap ──
    function click() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'square';
        osc.frequency.value = 1800;
        gain.gain.setValueAtTime(0.12 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // ── COUNTDOWN TICK: Subtle metronome pulse ──
    function tick() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.06 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    // ── LEVEL UP: Triumphant ascending fanfare ──
    function levelUp() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const t = now + i * 0.12;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.3 * volume, t + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.55);
        });

        // Shimmer sweep
        const sweep = c.createOscillator();
        const sGain = c.createGain();
        sweep.type = 'sine';
        sweep.frequency.setValueAtTime(800, now + 0.4);
        sweep.frequency.exponentialRampToValueAtTime(3000, now + 0.9);
        sGain.gain.setValueAtTime(0, now + 0.4);
        sGain.gain.linearRampToValueAtTime(0.06 * volume, now + 0.55);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        sweep.connect(sGain);
        sGain.connect(c.destination);
        sweep.start(now + 0.4);
        sweep.stop(now + 1.1);
    }

    // ── GAME OVER: Descending dark tone ──
    function gameOver() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Descending ominous notes
        [392, 349.23, 293.66, 220].forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            const t = now + i * 0.2;
            gain.gain.setValueAtTime(0.15 * volume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

            // Low-pass filter for darkness
            const filter = c.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.65);
        });
    }

    // ── XP GAIN: Quick satisfying ping ──
    function xpGain() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // ── MODAL: Subtle open/close whoosh ──
    function modalOpen() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.06 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    function modalClose() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.05 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // ── NAVIGATE: Smooth transition whoosh ──
    function navigate() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Filtered noise sweep
        const bufferSize = c.sampleRate * 0.2;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 0.15);
        filter.Q.value = 2;
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.06 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        noise.start(now);
    }

    // ── SENTINEL AMBIENT: Low sci-fi data hum ──
    function startAmbient() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        stopAmbient(); // Clear any existing

        // Base hum
        const osc1 = c.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 60;

        // Harmonic overtone
        const osc2 = c.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 120;

        // Very subtle high shimmer
        const osc3 = c.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = 3520;

        // LFO for movement
        const lfo = c.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        const lfoGain = c.createGain();
        lfoGain.gain.value = 8;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        ambientGain = c.createGain();
        ambientGain.gain.value = 0;
        ambientGain.gain.linearRampToValueAtTime(0.025 * volume, c.currentTime + 2);

        const g2 = c.createGain();
        g2.gain.value = 0.012 * volume;
        const g3 = c.createGain();
        g3.gain.value = 0.003 * volume;

        osc1.connect(ambientGain);
        osc2.connect(g2);
        g2.connect(ambientGain);
        osc3.connect(g3);
        g3.connect(ambientGain);
        ambientGain.connect(c.destination);

        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();

        ambientNode = { oscs: [osc1, osc2, osc3, lfo], gain: ambientGain };
    }

    function stopAmbient() {
        if (ambientNode) {
            try {
                const c = getCtx();
                if (c && ambientGain) {
                    ambientGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
                    setTimeout(() => {
                        ambientNode.oscs.forEach(o => { try { o.stop(); } catch (e) { } });
                        ambientNode = null;
                        ambientGain = null;
                    }, 600);
                } else {
                    ambientNode.oscs.forEach(o => { try { o.stop(); } catch (e) { } });
                    ambientNode = null;
                    ambientGain = null;
                }
            } catch (e) {
                ambientNode = null;
                ambientGain = null;
            }
        }
    }

    // ── STREAK MILESTONE: Special celebration at 5, 10, 15... ──
    function streakMilestone() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Quick arpeggio burst
        [784, 988, 1175, 1318.5, 1568].forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const t = now + i * 0.05;
            gain.gain.setValueAtTime(0.15 * volume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    // ── BOOT CHIME: Startup sequence ──
    function bootChime() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Three-tone ascending chime
        [330, 440, 660].forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const t = now + i * 0.15;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.12 * volume, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.65);
        });
    }

    // ── STATE MANAGEMENT ──
    function toggleMute() {
        muted = !muted;
        localStorage.setItem('nexus_sfx_muted', muted);
        if (muted) stopAmbient();
        updateMuteUI();
        return muted;
    }

    function setVolume(v) {
        volume = Math.max(0, Math.min(1, v));
        localStorage.setItem('nexus_sfx_volume', volume);
    }

    function isMuted() {
        return muted;
    }

    function updateMuteUI() {
        const btn = document.querySelector('#sfx-toggle');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = muted ? 'bx bx-volume-mute' : 'bx bx-volume-full';
            }
            btn.title = muted ? 'Unmute SFX' : 'Mute SFX';
            btn.classList.toggle('muted', muted);
        }
    }

    // ── AUTO-HOOK: Attach hover sounds to interactive elements ──
    function hookInteractiveElements() {
        // Hover sounds on buttons and cards
        document.querySelectorAll('.opt-btn, .mode-card, .nav-btn, .btn-primary, .action-btn, .sub-opt-btn').forEach(el => {
            el.addEventListener('mouseenter', hover);
        });

        // Click sounds on navigation
        document.querySelectorAll('.nav-btn, .back-link').forEach(el => {
            el.addEventListener('click', navigate);
        });

        // Click sounds on action buttons
        document.querySelectorAll('.btn-primary, .action-btn, .sub-opt-btn').forEach(el => {
            el.addEventListener('click', click);
        });
    }

    return {
        correct, wrong, hover, click, tick, levelUp, gameOver,
        xpGain, modalOpen, modalClose, navigate, startAmbient,
        stopAmbient, streakMilestone, bootChime, toggleMute,
        setVolume, isMuted, updateMuteUI, hookInteractiveElements
    };
})();
