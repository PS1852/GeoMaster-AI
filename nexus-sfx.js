/* =============================================================
   NEXUS SFX ENGINE v4.0 — "Less is More"
   Clean sine-only design. No buzz. No reverb. No gimmicks.
   Inspired by Duolingo, Apple, Notion.
   ============================================================= */

const NexusSFX = (() => {
    let ctx = null;
    let muted = localStorage.getItem('nexus_sfx_muted') === 'true';
    let volume = parseFloat(localStorage.getItem('nexus_sfx_volume') || '0.5');

    function getCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { return null; }
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ── The only helper we need: a single clean sine note ──
    function tone(freq, start, duration, amplitude) {
        const c = ctx;
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Smooth fade in and out — no clicks, no pops
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(amplitude * volume, start + 0.015);
        gain.gain.linearRampToValueAtTime(amplitude * volume * 0.7, start + duration * 0.4);
        gain.gain.linearRampToValueAtTime(0, start + duration);

        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(start);
        osc.stop(start + duration + 0.01);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ CORRECT — Two-note ascending chime
    // Just like Duolingo's success sound
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function correct() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(880, t, 0.15, 0.2);          // A5
        tone(1174.66, t + 0.12, 0.2, 0.2); // D6 (perfect fourth up)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ WRONG — Simple low double-tap
    // Soft, clearly audible, not harsh
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function wrong() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(330, t, 0.15, 0.2);       // E4
        tone(294, t + 0.12, 0.2, 0.2); // D4 (step down)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 👆 CLICK — Tiny pop
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function click() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(1200, t, 0.04, 0.1);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⬆️ LEVEL UP — Clean ascending scale
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function levelUp() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(523.25, t, 0.18, 0.15);        // C5
        tone(659.25, t + 0.12, 0.18, 0.15); // E5
        tone(783.99, t + 0.24, 0.18, 0.15); // G5
        tone(1046.5, t + 0.36, 0.3, 0.18);  // C6 (hold slightly longer)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💀 GAME OVER — Gentle descending pair
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function gameOver() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(440, t, 0.25, 0.15);       // A4
        tone(330, t + 0.2, 0.35, 0.15); // E4 (fifth down, longer fade)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚡ XP GAIN — Single bright ping
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function xpGain() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        tone(1318.5, c.currentTime, 0.12, 0.1); // E6
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // � STREAK — Quick three-note burst
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function streakMilestone() {
        if (muted) return;
        const c = getCtx(); if (!c) return;
        const t = c.currentTime;
        tone(1046.5, t, 0.1, 0.12);         // C6
        tone(1318.5, t + 0.07, 0.1, 0.12);  // E6
        tone(1568, t + 0.14, 0.15, 0.14);   // G6
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 BOOT — Same as level up
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function bootChime() { levelUp(); }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Empty stubs — intentionally silent
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function hover() { }
    function tick() { }
    function navigate() { }
    function modalOpen() { }
    function modalClose() { }
    function startAmbient() { }
    function stopAmbient() { }

    // ── State ──
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
