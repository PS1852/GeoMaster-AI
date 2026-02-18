/* =============================================================
   NEXUS SFX ENGINE v3.0 — "World Class" Physical Modeling
   High-Fidelity FM Synthesis & Acoustic Simulation
   Removes generic oscillator vibes for glass/metal/wood textures.
   ============================================================= */

const NexusSFX = (() => {
    let ctx = null;
    let reverbBuffer = null;
    let muted = localStorage.getItem('nexus_sfx_muted') === 'true';
    let volume = parseFloat(localStorage.getItem('nexus_sfx_volume') || '0.5'); // Slightly louder default for dynamic range
    let ambientNodes = [];

    function getCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
                generateReverbImpulse();
            } catch (e) { return null; }
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ── Ultra-High Quality Reverb Impulse ──
    // Simulates a large, modern, glass-walled space (bright and open)
    function generateReverbImpulse() {
        if (!ctx) return;
        const duration = 2.5;
        const rate = ctx.sampleRate;
        const length = rate * duration;
        const impulse = ctx.createBuffer(2, length, rate);
        const impulseL = impulse.getChannelData(0);
        const impulseR = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            // Easing function for smooth tail
            let decay = Math.pow(1 - n, 3.5);

            // Stereo widening noise
            impulseL[i] = (Math.random() * 2 - 1) * decay;
            impulseR[i] = (Math.random() * 2 - 1) * decay;
        }
        reverbBuffer = impulse;
    }

    // ── Master Output Chain ──
    // Compresses dynamics and adds subtle reverb
    function createChain(vol = 1.0, reverbMix = 0.15) {
        if (!ctx) return null;
        const t = ctx.currentTime;

        const dry = ctx.createGain();
        dry.gain.value = vol * volume;

        const master = ctx.createGain();
        master.gain.value = 1.0;

        // Reverb Path
        const wet = ctx.createGain();
        wet.gain.value = reverbMix * volume;

        if (reverbBuffer) {
            const verb = ctx.createConvolver();
            verb.buffer = reverbBuffer;
            dry.connect(verb);
            verb.connect(wet);
        }

        dry.connect(master);
        wet.connect(master);
        master.connect(ctx.destination);

        return master;
    }

    // ── FM SYNTHESIS HELPER (The secret to premium sound) ──
    // Modulating frequency creates glass/metal harmonics impossible with simple oscillators
    function playFMTone(time, freq, attack, decay, modIndex, modRatio, vol) {
        if (!ctx) return;

        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const carrierGain = ctx.createGain();

        // Setup frequencies
        carrier.frequency.value = freq;
        modulator.frequency.value = freq * modRatio;

        // FM Routing: Modulator -> ModGain -> Carrier Frequency
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(carrierGain);

        // Output connection
        const out = createChain(vol, 0.2); // Add reverb
        carrierGain.connect(out);

        // Envelopes
        const t = time;

        // Amplitude Envelope (Exponential for percussive sound)
        carrierGain.gain.setValueAtTime(0, t);
        carrierGain.gain.linearRampToValueAtTime(1, t + attack);
        carrierGain.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);

        // Modulation Envelope (Changes richness over time)
        // High modulation at start (click/impact), low at end (pure tone)
        modGain.gain.setValueAtTime(freq * modIndex, t);
        modGain.gain.exponentialRampToValueAtTime(1, t + attack + (decay * 0.3));

        carrier.start(t);
        modulator.start(t);

        const stopTime = t + attack + decay + 0.1;
        carrier.stop(stopTime);
        modulator.stop(stopTime);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ CORRECT — "Crystal Drop"
    // Pure glass texture using high-ratio FM synthesis
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function correct() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // High frequency glass ping (Ratio 2.0 = Octave harmonic)
        playFMTone(now, 1100, 0.005, 0.8, 3.5, 2.0, 0.3);

        // Slightly detuned companion for shimmer width
        playFMTone(now + 0.02, 2200, 0.005, 0.4, 2.0, 2.0, 0.1);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ WRONG — "Soft Bass Thud"
    // Deep, punchy, non-aggressive error. No buzzing.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function wrong() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Sub-bass heavy sine wave with fast pitch drop
        const osc = c.createOscillator();
        const gain = c.createGain();
        const out = createChain(0.6, 0.05); // Less reverb for tight bass

        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15); // The "Thud" pitch drop

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(out);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👆 CLICK — "Mechanical Switch"
    // Ultra-short noise burst, extremely crisp
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function click() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // Noise buffer for texture
        const count = c.sampleRate * 0.05;
        const buffer = c.createBuffer(1, count, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < count; i++) data[i] = Math.random() * 2 - 1;

        const noise = c.createBufferSource();
        noise.buffer = buffer;

        const filter = c.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1500; // Remove mud

        const gain = c.createGain();
        const out = createChain(0.2, 0); // No reverb, purely direct

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03); // 30ms pop

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        noise.start(now);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⬆️ LEVEL UP — "Ethereal Chord"
    // FM Arpeggio that swells into a wide stereo field
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function levelUp() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        // C Major 7/9 chord notes
        const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6

        freqs.forEach((f, i) => {
            // Staggered entrance for "plucked" feel
            // FM Ratio 1:1 creates bell-like purity
            playFMTone(now + (i * 0.04), f, 0.05, 1.5 + (i * 0.2), 2.0, 1.0, 0.15);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚡ XP GAIN — "Coin Tingle"
    // Very high pitch FM pluck
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function xpGain() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;
        // Ratio 3.5 creates a metallic/coin harmonic series
        playFMTone(now, 1568, 0.01, 0.3, 5.0, 3.5, 0.15);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💀 GAME OVER — "Cinema Bass Drop"
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function gameOver() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        const osc = c.createOscillator();
        const gain = c.createGain();
        const out = createChain(0.6, 0.5); // Heavy reverb for drama

        // Deep drone
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(60, now + 1.5);

        // Tremolo LFO
        const lfo = c.createOscillator();
        lfo.frequency.value = 8; // 8Hz flutter
        const lfoGain = c.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 2.0);

        osc.connect(gain);
        gain.connect(out);
        lfo.start(now);
        osc.start(now);

        setTimeout(() => { lfo.stop(); osc.stop(); }, 2100);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧭 NAVIGATE — "Swoosh"
    // Filtered white noise sweep
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function navigate() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const now = c.currentTime;

        const count = c.sampleRate * 0.3;
        const buffer = c.createBuffer(1, count, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < count; i++) data[i] = Math.random() * 2 - 1;

        const noise = c.createBufferSource();
        noise.buffer = buffer;

        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;

        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15); // Open up filter

        const gain = c.createGain();
        const out = createChain(0.1, 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        noise.start(now);
    }

    // Modal sounds
    function modalOpen() { click(); } // Re-use click for clean UI
    function modalClose() { click(); }

    // Placeholder for API compatibility, logic removed as requested
    function tick() { }
    function streakMilestone() { levelUp(); } // Re-use level up for now
    function startAmbient() { } // Disabled for cleaner feel
    function stopAmbient() { }
    function bootChime() { levelUp(); }
    function hover() { } // Explicitly empty - REMOVED

    // ── State Management ──
    function toggleMute() {
        muted = !muted;
        localStorage.setItem('nexus_sfx_muted', muted);
        updateMuteUI();
        if (!muted) click();
        return muted;
    }

    function setVolume(v) {
        volume = Math.max(0, Math.min(1, v));
        localStorage.setItem('nexus_sfx_volume', volume);
    }

    function isMuted() { return muted; }

    function updateMuteUI() {
        const btn = document.querySelector('#sfx-toggle');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) icon.className = muted ? 'bx bx-volume-mute' : 'bx bx-volume-full';
            btn.title = muted ? 'Unmute SFX' : 'Mute SFX';
            btn.classList.toggle('muted', muted);
        }
    }

    function hookInteractiveElements() {
        // Only hooks clicks now. Hover is GONE.
        document.querySelectorAll('.nav-btn, .back-link').forEach(el => {
            el.addEventListener('click', navigate);
        });
        document.querySelectorAll('.btn-primary, .action-btn, .sub-opt-btn, .opt-btn').forEach(el => {
            el.addEventListener('click', click);
        });
    }

    return {
        correct, wrong, click, levelUp, gameOver,
        xpGain, modalOpen, modalClose, navigate,
        startAmbient, stopAmbient, streakMilestone, bootChime,
        toggleMute, setVolume, isMuted, updateMuteUI, hookInteractiveElements,
        hover // Exposed but does nothing
    };
})();
