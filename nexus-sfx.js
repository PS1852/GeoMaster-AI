/* =============================================================
   NEXUS SFX ENGINE v2.0 — Premium Atmospheric Sound Design
   Luxury-grade audio for GeoMaster AI
   Layered synthesis · Convolution reverb · Spatial depth
   ============================================================= */

const NexusSFX = (() => {
    let ctx = null;
    let reverbNode = null;
    let muted = localStorage.getItem('nexus_sfx_muted') === 'true';
    let volume = parseFloat(localStorage.getItem('nexus_sfx_volume') || '0.4');
    let ambientNode = null;
    let lastHoverTime = 0;

    function getCtx() {
        if (!ctx) {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
                buildReverb();
            } catch (e) { return null; }
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ── Convolution reverb for spatial depth ──
    function buildReverb() {
        if (!ctx || reverbNode) return;
        try {
            const len = ctx.sampleRate * 1.5;
            const buf = ctx.createBuffer(2, len, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const d = buf.getChannelData(ch);
                for (let i = 0; i < len; i++) {
                    // Exponential decay with early reflections
                    const t = i / ctx.sampleRate;
                    const decay = Math.exp(-t * 4.5);
                    const earlyRef = t < 0.05 ? Math.exp(-t * 15) * 0.3 : 0;
                    d[i] = (Math.random() * 2 - 1) * (decay * 0.15 + earlyRef);
                }
            }
            reverbNode = ctx.createConvolver();
            reverbNode.buffer = buf;
        } catch (e) { }
    }

    // ── Output chain: dry/wet mixer with reverb ──
    function createOutput(dryLevel = 0.7, wetLevel = 0.25) {
        const c = getCtx();
        if (!c) return null;

        const dry = c.createGain();
        dry.gain.value = dryLevel * volume;
        dry.connect(c.destination);

        if (reverbNode) {
            const wet = c.createGain();
            wet.gain.value = wetLevel * volume;
            const reverbSend = c.createGain();
            reverbSend.gain.value = 1;
            reverbSend.connect(reverbNode);
            reverbNode.connect(wet);
            wet.connect(c.destination);
            return { dry, wet: reverbSend };
        }
        return { dry, wet: dry };
    }

    // ── Soft filtered noise burst ──
    function noiseHit(duration, freq, q, gainVal, t, dest) {
        const c = getCtx();
        if (!c) return;
        const size = c.sampleRate * duration;
        const buf = c.createBuffer(1, size, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq;
        bp.Q.value = q;
        const g = c.createGain();
        g.gain.setValueAtTime(gainVal * volume, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        src.connect(bp);
        bp.connect(g);
        g.connect(dest);
        src.start(t);
    }

    // ── Warm bell tone ──
    function bell(freq, t, dur, amp, dest) {
        const c = getCtx();
        if (!c) return;

        // Fundamental
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(amp * volume, t + 0.008);
        g.gain.setTargetAtTime(amp * 0.6 * volume, t + 0.008, 0.04);
        g.gain.setTargetAtTime(0.0001, t + dur * 0.3, dur * 0.35);

        // Soft harmonic (octave up, quiet)
        const osc2 = c.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;
        const g2 = c.createGain();
        g2.gain.setValueAtTime(0, t);
        g2.gain.linearRampToValueAtTime(amp * 0.12 * volume, t + 0.01);
        g2.gain.setTargetAtTime(0.0001, t + dur * 0.2, dur * 0.2);

        // Sub-harmonic warmth
        const osc3 = c.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 0.5;
        const g3 = c.createGain();
        g3.gain.setValueAtTime(0, t);
        g3.gain.linearRampToValueAtTime(amp * 0.06 * volume, t + 0.015);
        g3.gain.setTargetAtTime(0.0001, t + dur * 0.4, dur * 0.3);

        // Low-pass to soften everything
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = Math.min(freq * 4, 6000);
        lp.Q.value = 0.7;

        osc.connect(g); g.connect(lp);
        osc2.connect(g2); g2.connect(lp);
        osc3.connect(g3); g3.connect(lp);
        lp.connect(dest);

        osc.start(t); osc.stop(t + dur + 0.1);
        osc2.start(t); osc2.stop(t + dur + 0.1);
        osc3.start(t); osc3.stop(t + dur + 0.1);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ CORRECT — Warm crystalline chime (Duolingo-inspired)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function correct() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.6, 0.35);
        if (!out) return;
        const now = c.currentTime;

        // Warm major-third bell pair with gentle stagger
        bell(880, now, 0.6, 0.18, out.dry);
        bell(880, now, 0.6, 0.10, out.wet);
        bell(1108.73, now + 0.07, 0.5, 0.14, out.dry);
        bell(1108.73, now + 0.07, 0.5, 0.09, out.wet);

        // Soft breathy texture
        noiseHit(0.12, 5000, 0.5, 0.03, now, out.dry);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ WRONG — Muffled organic thud (not jarring)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function wrong() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.75, 0.2);
        if (!out) return;
        const now = c.currentTime;

        // Two soft detuned tones (minor second = tension)
        const o1 = c.createOscillator();
        o1.type = 'sine';
        o1.frequency.value = 220;
        const o2 = c.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = 233.08; // Minor second

        const g = c.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.18 * volume, now + 0.015);
        g.gain.setTargetAtTime(0.0001, now + 0.08, 0.12);

        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 600;
        lp.Q.value = 1;

        o1.connect(g);
        o2.connect(g);
        g.connect(lp);
        lp.connect(out.dry);
        lp.connect(out.wet);

        // Soft thump body
        const thump = c.createOscillator();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(120, now);
        thump.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        const tg = c.createGain();
        tg.gain.setValueAtTime(0.12 * volume, now);
        tg.gain.setTargetAtTime(0.0001, now + 0.04, 0.06);
        thump.connect(tg);
        tg.connect(out.dry);

        o1.start(now); o1.stop(now + 0.5);
        o2.start(now); o2.stop(now + 0.5);
        thump.start(now); thump.stop(now + 0.3);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖱️ HOVER — Barely-there glass tap
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function hover() {
        if (muted) return;
        const now = Date.now();
        if (now - lastHoverTime < 60) return; // Debounce
        lastHoverTime = now;

        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        const out = createOutput(0.8, 0.15);
        if (!out) return;

        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 3200 + Math.random() * 800;
        const g = c.createGain();
        g.gain.setValueAtTime(0.02 * volume, t);
        g.gain.setTargetAtTime(0.0001, t + 0.01, 0.015);

        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 5000;

        osc.connect(g);
        g.connect(lp);
        lp.connect(out.dry);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👆 CLICK — Soft mechanical latch
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function click() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;

        // Soft filtered click noise
        const size = c.sampleRate * 0.025;
        const buf = c.createBuffer(1, size, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < size; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-(i / c.sampleRate) * 200);
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const hp = c.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2000;
        const g = c.createGain();
        g.gain.value = 0.08 * volume;
        src.connect(hp);
        hp.connect(g);
        g.connect(c.destination);
        src.start(t);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏱️ TICK — Minimal water-drop pulse
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function tick() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);
        const g = c.createGain();
        g.gain.setValueAtTime(0.04 * volume, t);
        g.gain.setTargetAtTime(0.0001, t + 0.02, 0.02);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⬆️ LEVEL UP — Ethereal harp cascade with shimmer
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function levelUp() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.5, 0.45);
        if (!out) return;
        const now = c.currentTime;

        // Pentatonic harp cascade (C-D-E-G-A-C)
        const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
        notes.forEach((freq, i) => {
            const delay = i * 0.09;
            const amp = 0.14 - i * 0.012;
            bell(freq, now + delay, 0.9 - i * 0.06, amp, out.dry);
            bell(freq, now + delay, 0.9 - i * 0.06, amp * 0.5, out.wet);
        });

        // Shimmer: high sine sweep with heavy reverb
        const shimmer = c.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(2000, now + 0.4);
        shimmer.frequency.exponentialRampToValueAtTime(6000, now + 1.2);
        const sg = c.createGain();
        sg.gain.setValueAtTime(0, now + 0.4);
        sg.gain.linearRampToValueAtTime(0.03 * volume, now + 0.6);
        sg.gain.setTargetAtTime(0.0001, now + 0.9, 0.15);
        shimmer.connect(sg);
        sg.connect(out.wet);
        shimmer.start(now + 0.4);
        shimmer.stop(now + 1.4);

        // Soft breath texture
        noiseHit(0.4, 8000, 0.3, 0.015, now + 0.3, out.wet);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💀 GAME OVER — Deep ambient sigh
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function gameOver() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.55, 0.4);
        if (!out) return;
        const now = c.currentTime;

        // Slow descending pad (Cm chord dissolving)
        [261.63, 311.13, 392].forEach((freq, i) => {
            const osc = c.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 1.5);
            const g = c.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.09 * volume, now + 0.15);
            g.gain.setTargetAtTime(0.0001, now + 0.5, 0.4);

            const lp = c.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.setValueAtTime(2000, now);
            lp.frequency.exponentialRampToValueAtTime(200, now + 1.5);

            osc.connect(lp);
            lp.connect(g);
            g.connect(out.dry);
            g.connect(out.wet);
            osc.start(now);
            osc.stop(now + 2);
        });

        // Breath out
        noiseHit(0.8, 800, 0.5, 0.02, now + 0.1, out.wet);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚡ XP GAIN — Tiny crystal tap
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function xpGain() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        const out = createOutput(0.7, 0.25);
        if (!out) return;

        bell(1318.5, t, 0.25, 0.08, out.dry);
        bell(1318.5, t, 0.25, 0.04, out.wet);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 MODAL OPEN — Soft glass slide up
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function modalOpen() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;

        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        const g = c.createGain();
        g.gain.setValueAtTime(0.04 * volume, t);
        g.gain.setTargetAtTime(0.0001, t + 0.06, 0.04);

        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3000;

        osc.connect(lp);
        lp.connect(g);
        g.connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 MODAL CLOSE — Soft glass slide down
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function modalClose() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;

        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.07);
        const g = c.createGain();
        g.gain.setValueAtTime(0.03 * volume, t);
        g.gain.setTargetAtTime(0.0001, t + 0.05, 0.03);

        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2500;

        osc.connect(lp);
        lp.connect(g);
        g.connect(c.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧭 NAVIGATE — Breath-like whoosh
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function navigate() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;

        const size = c.sampleRate * 0.18;
        const buf = c.createBuffer(1, size, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;

        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(600, t);
        bp.frequency.exponentialRampToValueAtTime(3000, t + 0.1);
        bp.frequency.exponentialRampToValueAtTime(800, t + 0.18);
        bp.Q.value = 1.5;

        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035 * volume, t + 0.04);
        g.gain.setTargetAtTime(0.0001, t + 0.1, 0.04);

        src.connect(bp);
        bp.connect(g);
        g.connect(c.destination);
        src.start(t);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 SENTINEL AMBIENT — Deep-space analog warmth
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function startAmbient() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        stopAmbient();

        const master = c.createGain();
        master.gain.value = 0;
        master.gain.linearRampToValueAtTime(0.015 * volume, c.currentTime + 3);

        // Deep pad: two detuned sines
        const o1 = c.createOscillator();
        o1.type = 'sine'; o1.frequency.value = 55;
        const o2 = c.createOscillator();
        o2.type = 'sine'; o2.frequency.value = 55.3; // Slow beat frequency

        // Breathy texture
        const o3 = c.createOscillator();
        o3.type = 'sine'; o3.frequency.value = 110;
        const o3g = c.createGain();
        o3g.gain.value = 0.3;

        // LFO for gentle movement
        const lfo = c.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 0.15;
        const lfoG = c.createGain();
        lfoG.gain.value = 3;
        lfo.connect(lfoG);
        lfoG.connect(o1.frequency);

        // Filter for warmth
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 200;
        lp.Q.value = 1;

        o1.connect(lp);
        o2.connect(lp);
        o3.connect(o3g); o3g.connect(lp);
        lp.connect(master);
        master.connect(c.destination);

        o1.start(); o2.start(); o3.start(); lfo.start();
        ambientNode = { oscs: [o1, o2, o3, lfo], gain: master };
    }

    function stopAmbient() {
        if (!ambientNode) return;
        try {
            const c = getCtx();
            if (c && ambientNode.gain) {
                ambientNode.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
                const node = ambientNode;
                ambientNode = null;
                setTimeout(() => {
                    node.oscs.forEach(o => { try { o.stop(); } catch (e) { } });
                }, 1000);
            } else {
                ambientNode.oscs.forEach(o => { try { o.stop(); } catch (e) { } });
                ambientNode = null;
            }
        } catch (e) { ambientNode = null; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔥 STREAK MILESTONE — Glass wind chime cluster
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function streakMilestone() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.5, 0.45);
        if (!out) return;
        const now = c.currentTime;

        // Random pentatonic cluster (like wind chimes)
        const scale = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
        for (let i = 0; i < 4; i++) {
            const freq = scale[Math.floor(Math.random() * scale.length)];
            const delay = i * 0.06 + Math.random() * 0.03;
            const amp = 0.07 + Math.random() * 0.04;
            bell(freq, now + delay, 0.5, amp, out.dry);
            bell(freq, now + delay, 0.5, amp * 0.4, out.wet);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 BOOT CHIME — Signature 3-note identity
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function bootChime() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const out = createOutput(0.5, 0.45);
        if (!out) return;
        const now = c.currentTime;

        // E-G#-B (E major – bright and confident)
        bell(659.25, now, 0.8, 0.12, out.dry);
        bell(659.25, now, 0.8, 0.06, out.wet);
        bell(830.61, now + 0.15, 0.7, 0.10, out.dry);
        bell(830.61, now + 0.15, 0.7, 0.06, out.wet);
        bell(987.77, now + 0.30, 0.9, 0.13, out.dry);
        bell(987.77, now + 0.30, 0.9, 0.08, out.wet);

        // Soft breath underneath
        noiseHit(0.3, 6000, 0.3, 0.01, now + 0.1, out.wet);
    }

    // ── State Management ──
    function toggleMute() {
        muted = !muted;
        localStorage.setItem('nexus_sfx_muted', muted);
        if (muted) stopAmbient();
        updateMuteUI();
        if (!muted) click(); // Feedback that sound is now on
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
        // Hover on interactive elements (debounced)
        document.querySelectorAll('.opt-btn, .mode-card, .nav-btn, .btn-primary, .action-btn, .sub-opt-btn').forEach(el => {
            el.addEventListener('mouseenter', hover);
        });

        // Navigate on nav buttons
        document.querySelectorAll('.nav-btn, .back-link').forEach(el => {
            el.addEventListener('click', navigate);
        });

        // Click on action buttons
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
