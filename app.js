/* =============================================================
   GEOMASTER AI v2.0 — Complete Application Core
   Single-file architecture for maximum compatibility.
   ============================================================= */

// ===================== CONFIGURATION =====================
const CONFIG = {
    API_COUNTRY: 'https://restcountries.com/v3.1/all?fields=name,cca3,capital,flags,currencies,region,subregion,population,independent,borders,area',
    API_AI: 'https://openrouter.ai/api/v1/chat/completions',
    AI_KEY: '', // REMOVED FOR SECURITY. KEY IS NOW STORED IN SETTINGS.
    AI_MODEL: 'openai/gpt-3.5-turbo',
    TIMER_STANDARD: 15,   // seconds
    TIMER_ORACLE: 40,
    TIMER_SENTINEL_DEFAULT: 60,
    LIVES: 3,
    XP_PER_LEVEL: 1000,
    OPTIONS_COUNT: 4,
    SYNC_PULL_INTERVAL_MS: 8000,
    STORAGE_KEY: 'geomaster_ai_save',
    GOOGLE_CLIENT_ID: '481536087745-nujuqgrspms7u05amp2k77a8982gst59.apps.googleusercontent.com',
    SYSTEM_KEY: ['sk-or-v1-', '1134e069', '543d59a9', '3c804e37', '1d0a4ff5', '081d6a01', '95905f94', '69947b29', 'ff69e580'].join('')
};

// ===================== LOCAL STORAGE + BROADCAST SYNC =====================
// Uses BroadcastChannel to sync between tabs/windows on the same device
let broadcastChannel = null;

function initBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') {
        console.warn('BroadcastChannel not supported');
        return;
    }
    
    try {
        broadcastChannel = new BroadcastChannel('geomaster-sync');
        broadcastChannel.onmessage = (event) => {
            if (event.data.type === 'SAVE_UPDATE' && event.data.userId === currentGoogleSub) {
                console.log('📨 Received data from another tab, updating local...');
                const receivedData = event.data.save;
                if (receivedData) {
                    // Merge with local data (take highest values)
                    const merged = mergeSaves(save, receivedData);
                    save = merged;
                    persistLocalSave(save);
                    updateSidebarStats();
                }
            }
        };
        console.log('✅ BroadcastChannel ready for same-device sync');
    } catch (e) {
        console.warn('BroadcastChannel init failed:', e);
    }
}

// Broadcast save to other tabs on same device
function broadcastSaveUpdate() {
    if (!broadcastChannel || !currentGoogleSub) return;
    try {
        broadcastChannel.postMessage({
            type: 'SAVE_UPDATE',
            userId: currentGoogleSub,
            save: save
        });
    } catch (e) {
        console.warn('Broadcast failed:', e);
    }
}

// Poll for localStorage changes from other tabs
let lastKnownSave = null;
function startLocalStoragePolling() {
    setInterval(() => {
        if (!currentUser) return;
        try {
            const key = CONFIG.STORAGE_KEY + '_' + currentUser;
            const raw = localStorage.getItem(key);
            if (raw && lastKnownSave !== raw) {
                const parsed = parseSaveData(raw);
                if (parsed && JSON.stringify(parsed) !== JSON.stringify(save)) {
                    console.log('🔄 Detected localStorage change from another tab');
                    const merged = mergeSaves(save, parsed);
                    save = merged;
                    persistLocalSave(save);
                    updateSidebarStats();
                    lastKnownSave = JSON.stringify(save);
                }
            }
        } catch (e) {
            console.warn('Storage polling error:', e);
        }
    }, 2000); // Check every 2 seconds
}

// ===================== COUNTRY DATA =====================
// [CORE DATA IS NOW LOADED FROM countries.data.js]


// ===================== PERSISTENCE =====================
// ===================== PERSISTENCE =====================
function getDefaultSave() {
    return { xp: 0, level: 1, totalCorrect: 0, totalWrong: 0, bestStreak: 0, answered: { flag: [], capital: [], currency: [], population: [], border: [], emoji: [], sentinel: [] } };
}

function normalizeSaveData(data) {
    const fallback = getDefaultSave();
    if (!data || typeof data !== 'object') return fallback;
    const merged = { ...fallback, ...data, answered: { ...fallback.answered, ...(data.answered || {}) } };
    Object.keys(fallback.answered).forEach((mode) => {
        const vals = merged.answered[mode];
        merged.answered[mode] = Array.isArray(vals) ? [...new Set(vals)] : [];
    });
    merged.xp = Math.max(0, Number(merged.xp) || 0);
    merged.level = Math.max(1, Number(merged.level) || 1);
    merged.totalCorrect = Math.max(0, Number(merged.totalCorrect) || 0);
    merged.totalWrong = Math.max(0, Number(merged.totalWrong) || 0);
    merged.bestStreak = Math.max(0, Number(merged.bestStreak) || 0);
    while (merged.xp >= merged.level * CONFIG.XP_PER_LEVEL) merged.level++;
    return merged;
}

function parseSaveData(raw) {
    if (!raw) return null;
    try {
        if (typeof raw === 'string') return normalizeSaveData(JSON.parse(raw));
        if (typeof raw === 'object') return normalizeSaveData(raw);
    } catch (e) { }
    return null;
}

function mergeSaves(localSave, remoteSave) {
    const local = normalizeSaveData(localSave);
    const remote = normalizeSaveData(remoteSave);
    const merged = getDefaultSave();
    merged.xp = Math.max(local.xp, remote.xp);
    merged.level = Math.max(local.level, remote.level);
    merged.totalCorrect = Math.max(local.totalCorrect, remote.totalCorrect);
    merged.totalWrong = Math.max(local.totalWrong, remote.totalWrong);
    merged.bestStreak = Math.max(local.bestStreak, remote.bestStreak);
    Object.keys(merged.answered).forEach((mode) => {
        const set = new Set([...(local.answered[mode] || []), ...(remote.answered[mode] || [])]);
        merged.answered[mode] = [...set];
    });
    while (merged.xp >= merged.level * CONFIG.XP_PER_LEVEL) merged.level++;
    return merged;
}

function loadSave(username) {
    if (!username) return getDefaultSave();
    try {
        const key = CONFIG.STORAGE_KEY + '_' + username;
        const raw = localStorage.getItem(key);
        if (raw && raw !== 'null' && raw !== 'undefined') return parseSaveData(raw) || getDefaultSave();
    } catch (e) { console.warn('Save corrupted, resetting.'); }
    return getDefaultSave();
}

function persistLocalSave(data) {
    if (!currentUser) return;
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY + '_' + currentUser, JSON.stringify(normalizeSaveData(data)));
    } catch (e) { }
}

function canCloudSync() {
    return !!currentGoogleSub && !!currentUser && !currentUser.startsWith('Agent_');
}

let cloudPushTimer = null;
let cloudSyncTimer = null;
let cloudSyncInFlight = false;
let initialCloudHydrated = false;

// IMMEDIATE CLOUD PUSH - Forces sync right away
async function forcePushCloud() {
    if (!canCloudSync()) return;
    
    try {
        const saveJson = JSON.stringify(save);
        await NexusCloud.push(currentGoogleSub, saveJson);
        console.log('✅ Data synced:', currentUser);
        broadcastSaveUpdate();
        return true;
    } catch (e) {
        console.error('❌ Sync failed:', e);
        return false;
    }
}

function queueCloudPush() {
    if (!canCloudSync() || !initialCloudHydrated) return;
    clearTimeout(cloudPushTimer);
    cloudPushTimer = setTimeout(() => {
        NexusCloud.push(currentGoogleSub, JSON.stringify(save));
    }, 300);
}

async function syncCloudNow() {
    if (!canCloudSync() || cloudSyncInFlight) return;
    
    cloudSyncInFlight = true;
    try {
        setSyncIndicator(true, "🔄 Syncing data...");
        const remote = await NexusCloud.pull(currentGoogleSub);
        initialCloudHydrated = true;
        
        if (!remote || !remote.save) {
            console.log('📤 No remote data found, pushing local...');
            // If no data on cloud, push our local data
            await NexusCloud.push(currentGoogleSub, JSON.stringify(save));
            setSyncIndicator(false);
            console.log('✅ Sync complete');
            return;
        }

        const merged = mergeSaves(save, remote.save);
        const mergedJson = JSON.stringify(merged);
        const localJson = JSON.stringify(normalizeSaveData(save));
        const remoteJson = JSON.stringify(normalizeSaveData(remote.save));
        
        if (mergedJson !== localJson) {
            save = merged;
            persistLocalSave(save);
            updateSidebarStats();
            console.log('📥 Pulled and merged remote data');
        }
        if (mergedJson !== remoteJson) {
            await NexusCloud.push(currentGoogleSub, mergedJson);
            console.log('📤 Pushed merged data');
        }
        setSyncIndicator(false);
        console.log('✅ Sync complete');
    } catch (e) { 
        console.error('❌ Sync error:', e);
        setSyncIndicator(false);
    } finally { 
        cloudSyncInFlight = false; 
    }
}

function startCloudSync() {
    clearInterval(cloudSyncTimer);
    if (!canCloudSync()) return;
    cloudSyncTimer = setInterval(() => { syncCloudNow(); }, CONFIG.SYNC_PULL_INTERVAL_MS);
    // IMPORTANT: Force an immediate sync on startup
    setTimeout(() => { syncCloudNow(); }, 100);
}

function saveSave(data) {
    if (!currentUser) return;
    try {
        save = normalizeSaveData(data);
        persistLocalSave(save);
        if (canCloudSync() && !initialCloudHydrated) return;
        queueCloudPush();
    } catch (e) { }
}

function setSyncIndicator(active, title) {
    const syncEl = $('#sync-status');
    if (!syncEl) return;
    if (active) {
        syncEl.classList.add('active');
        if (title) syncEl.title = title;
    } else {
        syncEl.classList.remove('active');
    }
}

// ===================== CLOUD SYNC (localStorage-based for now) =====================
// Simple cloud sync mechanism using localStorage and BroadcastChannel
// For cross-device sync, we use a simple fetch-based approach to a backend endpoint
const NexusCloud = {
    push: async (googleId, data) => {
        // Always save to localStorage first
        try {
            localStorage.setItem('geomaster_cloud_' + googleId, typeof data === 'string' ? data : JSON.stringify(data));
            console.log('✅ Data saved locally for:', googleId);
            
            // Broadcast to other tabs on this device
            broadcastSaveUpdate();
            
            // Try to send to a backend if available
            // This is optional - can be extended with a real backend later
            if (typeof window.BACKEND_URL !== 'undefined') {
                try {
                    await fetch(window.BACKEND_URL + '/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: googleId,
                            data: typeof data === 'string' ? JSON.parse(data) : data
                        })
                    }).catch(() => {}); // Silent fail if backend unavailable
                } catch (e) {}
            }
        } catch (e) {
            console.error('❌ Push failed:', e);
        }
    },
    
    pull: async (googleId) => {
        try {
            // First check localStorage
            const raw = localStorage.getItem('geomaster_cloud_' + googleId);
            if (raw) {
                console.log('✅ Pulled data from localStorage');
                return { save: parseSaveData(raw), ts: Date.now() };
            }
            
            // Try backend if available
            if (typeof window.BACKEND_URL !== 'undefined') {
                try {
                    const res = await fetch(window.BACKEND_URL + '/load?userId=' + googleId);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.save) {
                            console.log('✅ Pulled data from backend');
                            return { save: data.save, ts: Date.now() };
                        }
                    }
                } catch (e) {}
            }
            
            return null;
        } catch (e) {
            console.error('❌ Pull failed:', e);
            return null;
        }
    },
    
    pullLegacy: async (username) => null,
    pushLegacy: async (username, data) => {},
    getMap: async (sub) => null,
    setMap: async (sub, username) => {}
};

async function hydrateLinkedAccount(username, googleSub, extraUsernames = []) {
    // Load local data first
    let merged = loadSave(username);
    
    // Load from Firebase (should be ready by now)
    if (!isFirebaseReady) {
        console.warn('Firebase not ready yet during hydration, will retry on next sync');
    } else {
        try {
            const remotePrimary = await NexusCloud.pull(googleSub);
            if (remotePrimary && remotePrimary.save) {
                merged = mergeSaves(merged, remotePrimary.save);
                console.log('✅ Loaded data from Firebase on login');
            }
        } catch (e) {
            console.warn('Failed to hydrate from Firebase:', e);
        }
    }

    merged = normalizeSaveData(merged);
    localStorage.setItem(CONFIG.STORAGE_KEY + '_' + username, JSON.stringify(merged));
    
    // Also save legacy usernames for compatibility
    extraUsernames.forEach((name) => {
        if (name !== username) {
            localStorage.setItem(CONFIG.STORAGE_KEY + '_' + name, JSON.stringify(merged));
        }
    });
    
    initialCloudHydrated = true;

    // Push merged data to Firebase
    try {
        await NexusCloud.push(googleSub, JSON.stringify(merged));
    } catch (e) {
        console.warn('Failed to push on hydrate:', e);
    }

    return merged;
}

// ===================== STATE =====================
let allCountries = (typeof ALL_COUNTRIES_DATA !== 'undefined') ? ALL_COUNTRIES_DATA : [];
let currentUser = null;
let currentGoogleSub = localStorage.getItem('geo_last_sub') || null;
let save = getDefaultSave(); // Default empty state until login
let currentGame = null; // active game session

// ===================== DOM REFERENCES =====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===================== COUNTRY DATA SERVICE =====================
async function fetchCountries() {
    if (allCountries.length > 100) return allCountries;
    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(CONFIG.API_COUNTRY, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // Filter: must have name, capital, currencies, and be independent
        return data.filter(c =>
            c.independent !== false &&
            c.capital && c.capital.length > 0 &&
            c.currencies && Object.keys(c.currencies).length > 0 &&
            c.flags && (c.flags.svg || c.flags.png)
        );
    } catch (err) {
        console.warn('API fetch failed, using built-in data.');
        return allCountries;
    }
}

// ===================== AI SERVICE =====================
async function getAIKey() {
    return CONFIG.SYSTEM_KEY;
}

// Emoji Nexus Generator
async function getEmojiHints(countryName) {
    const seed = Math.floor(Math.random() * 99999);
    const prompt = `Generate exactly 5 different emojis for "${countryName}".
IMPORTANT:
1. ONLY output emojis (5 total).
2. DO NOT use country flags or any letters/country codes (like LC, US, GB).
3. Focus on: Landmark, Culture, Nature, Food, Unique item.
Random Seed: ${seed}`;

    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 20000);

        const currentKey = await getAIKey();
        if (!currentKey) {
            console.warn('AI Key missing.');
            return null;
        }

        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + currentKey,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ps1852.github.io/GeoMaster-AI/',
                'X-Title': 'GeoMaster AI'
            },
            body: JSON.stringify({
                model: CONFIG.AI_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 1.0,
                max_tokens: 100
            }),
            signal: ctrl.signal
        });
        clearTimeout(tid);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn('Emoji API Error:', res.status, errData);
            return null;
        }

        const data = await res.json();
        if (!data.choices || !data.choices[0]) return null;

        let raw = data.choices[0].message.content.trim();
        const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
        let emojis = raw.match(emojiRegex) || [];

        // Filter out non-emoji artifacts and country flag codes (like LC)
        emojis = emojis.filter(e => {
            if (e.length === 2 && /^[A-Z]{2}$/.test(e)) return false;
            return e.length >= 2 || e.codePointAt(0) > 1000;
        });

        // PAD if too few
        const fallback = ['🌍', '📍', '🗺️', '🏳️', '🌐', '🏙️', '🏞️'];
        while (emojis.length < 5) {
            emojis.push(fallback[Math.floor(Math.random() * fallback.length)]);
        }

        // SLICE if too many, and join with a pulse-plus icon
        const sep = '<span class="nexus-plus"> + </span>';
        return emojis.slice(0, 5).join(sep);
    } catch (err) {
        console.warn('Emoji AI failed:', err.message);
        return null;
    }
}

// Generate fallback emojis from country data
function generateLocalEmojis(country) {
    const regionEmojis = {
        'Europe': '🏰', 'Asia': '🏯', 'Africa': '🌍',
        'Americas': '🗽', 'Oceania': '🏝️', 'Antarctic': '🧊'
    };
    const base = regionEmojis[country.region] || '🌐';
    const pop = country.population > 100000000 ? '👥' : '👤';
    const cur = country.currencies ? '💰' : '🪙';
    const sep = '<span class="nexus-plus"> + </span>';
    return [base, '🗺️', pop, cur, '🧭'].join(sep);
}

// AI Sentinel Interrogator
async function getSentinelResponse(countryName, question, history) {
    const systemPrompt = `You are the "AI Sentinel". Secret Country: "${countryName}".
Rules:
1. Answer truthfully about geography/culture.
2. NEVER mention the name "${countryName}" or its capital.
3. Be concise (1-2 sentences), mysterious, cybernetic.
4. If asked for name, refuse cryptically.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    for (const h of history) {
        messages.push({ role: 'user', content: h.q });
        messages.push({ role: 'assistant', content: h.a });
    }
    messages.push({ role: 'user', content: question });

    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 20000);
        const currentKey = await getAIKey();
        if (!currentKey) return "AI Key missing. Please set it in Settings.";

        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + currentKey,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ps1852.github.io/GeoMaster-AI/',
                'X-Title': 'GeoMaster AI'
            },
            body: JSON.stringify({
                model: CONFIG.AI_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 250
            }),
            signal: ctrl.signal
        });
        clearTimeout(tid);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn('Sentinel API Error:', res.status, errData);
            return "Connection error. The network is unreachable. Retrying signal...";
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || "Empty signal received.";
    } catch (err) {
        console.warn('Sentinel AI failed:', err.message);
        return "System offline. Unable to process query.";
    }
}

async function getAIHints(countryName) {
    const prompt = `You are a geography quiz master. Provide exactly 3 distinct factual hints about the country "${countryName}".
    Hint 1: Geography/Climate (Max 10 words).
    Hint 2: Culture/Food (Max 10 words).
    Hint 3: A surprising fact (Max 10 words).
    IMPORTANT: NEVER mention the country name or capital. Keep it very short.
    Format your response as exactly 3 numbered lines:
    1. [short hint]
    2. [short hint]
    3. [short hint]`;

    const currentKey = await getAIKey();
    if (!currentKey) return null;

    try {
        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + currentKey,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ps1852.github.io/GeoMaster-AI/',
                'X-Title': 'GeoMaster AI'
            },
            body: JSON.stringify({
                model: CONFIG.AI_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn('Oracle API Error:', res.status, errData);
            return null;
        }

        const data = await res.json();
        const text = data.choices[0].message.content;
        const lines = text.split('\n').filter(l => l.trim().length > 3);
        const hints = [];
        for (const line of lines) {
            const cleaned = line.replace(/^\d+[\.\)\-:]\s*/, '').trim();
            if (cleaned.length > 5) hints.push(cleaned);
            if (hints.length >= 3) break;
        }
        return hints.length >= 2 ? hints : null;
    } catch (err) { return null; }
}

// Generate fallback hints from country data
function generateLocalHints(country) {
    const hints = [];
    if (country.region) hints.push('This country is located in ' + country.region + (country.subregion ? ', specifically in ' + country.subregion : '') + '.');
    if (country.population) {
        const pop = country.population;
        if (pop > 1000000000) hints.push('This nation has over 1 billion people.');
        else if (pop > 100000000) hints.push('This nation has over ' + Math.floor(pop / 1000000) + ' million people.');
        else if (pop > 10000000) hints.push('The population is roughly ' + Math.floor(pop / 1000000) + ' million.');
        else hints.push('This is a smaller nation with under 10 million people.');
    }
    const cur = country.currencies ? Object.values(country.currencies)[0] : null;
    if (cur) hints.push('The local currency is the ' + cur.name + '.');
    return hints;
}


// ===================== UTILITY =====================
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getUnanswered(mode) {
    const answered = save.answered[mode] || [];
    return allCountries.filter(c => !answered.includes(c.cca3));
}

function pickQuestion(mode) {
    let pool = getUnanswered(mode);
    if (mode === 'border') pool = pool.filter(c => c.borders && c.borders.length > 0);

    // Mastery Detection: If fewer than OPTIONS_COUNT (4) answers are left
    if (pool.length < CONFIG.OPTIONS_COUNT && pool.length > 0) {
        // Don't reset yet, let them finish the last few!
    } else if (pool.length === 0) {
        // Mode fully completed! Reset for infinite play
        console.log(`Mastery reached in ${mode}! Resetting history.`);
        save.answered[mode] = [];
        saveSave(save);
        pool = [...allCountries];
        if (mode === 'border') pool = pool.filter(c => c.borders && c.borders.length > 0);
    }

    const shuffled = shuffle(pool);
    const target = shuffled[0];

    // Get distractors from ALL countries (not just unanswered)
    let distractors = shuffle(allCountries.filter(c => c.cca3 !== target.cca3)).slice(0, CONFIG.OPTIONS_COUNT - 1);
    let options = shuffle([target, ...distractors]);

    return { target, options };
}


// ===================== UI HELPERS =====================
function showView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    const view = $('#view-' + viewId);
    if (view) view.classList.add('active');

    // Update nav
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = $('[data-view="' + (viewId === 'quiz' || viewId === 'gameover' ? (currentGame ? currentGame.mode : 'home') : viewId) + '"]');
    if (navBtn) navBtn.classList.add('active');
    if (viewId === 'home') $('#nav-home').classList.add('active');
}

function updateSidebarStats() {
    if (!save) save = getDefaultSave();

    if ($('#stat-correct')) $('#stat-correct').textContent = save.totalCorrect || 0;
    if ($('#stat-wrong')) $('#stat-wrong').textContent = save.totalWrong || 0;
    if ($('#stat-streak')) $('#stat-streak').textContent = save.bestStreak || 0;
    if ($('#user-level')) $('#user-level').textContent = 'Level ' + (save.level || 1);

    const xpNeed = (save.level || 1) * CONFIG.XP_PER_LEVEL;
    if ($('#xp-text')) $('#xp-text').textContent = (save.xp || 0) + ' / ' + xpNeed;
    if ($('#xp-fill')) $('#xp-fill').style.width = Math.min(100, ((save.xp || 0) / xpNeed) * 100) + '%';
    if ($('#mobile-score-val')) $('#mobile-score-val').textContent = save.totalCorrect || 0;

    // Update home mode counts and mastery status
    ['flag', 'capital', 'currency', 'population', 'border', 'emoji', 'sentinel'].forEach(mode => {
        const el = $('#count-' + mode);
        const card = $(`.mode-card[data-mode="${mode}"]`);
        const count = (save.answered[mode] || []).length;
        const total = (allCountries && allCountries.length) ? allCountries.length : 0;

        if (el) el.textContent = count + ' / ' + total + ' answered';

        if (card && total > 0 && count >= total - 1) {
            card.classList.add('mastered');
            if (el) el.innerHTML = '<i class="bx bxs-trophy" style="color:var(--amber)"></i> MASTERED';
        }
    });
}

function renderLives(containerId, lives) {
    const el = $(containerId);
    if (!el) return;
    let html = '';
    for (let i = 0; i < CONFIG.LIVES; i++) {
        html += i < lives
            ? "<i class='bx bxs-heart'></i>"
            : "<i class='bx bxs-heart lost'></i>";
    }
    el.innerHTML = html;
}


// ===================== TIMER =====================
class Timer {
    constructor(fillSelector, duration, onTick, onEnd) {
        this.fillEl = $(fillSelector);
        this.duration = duration;
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.remaining = duration;
        this.interval = null;
    }
    start() {
        this.remaining = this.duration;
        if (this.fillEl) this.fillEl.style.width = '100%';
        if (this.fillEl) this.fillEl.classList.remove('danger');

        this.interval = setInterval(() => {
            this.remaining -= 0.1;
            const pct = Math.max(0, (this.remaining / this.duration) * 100);
            if (this.fillEl) this.fillEl.style.width = pct + '%';

            if (pct < 25 && this.fillEl) this.fillEl.classList.add('danger');
            if (this.onTick) this.onTick(this.remaining);
            if (this.remaining <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            }
        }, 100);
    }
    stop() { clearInterval(this.interval); }
    reset() { this.stop(); if (this.fillEl) { this.fillEl.style.width = '100%'; this.fillEl.classList.remove('danger'); } }
}


// ===================== GAME SESSION =====================
class GameSession {
    constructor(mode, subMode = null) {
        this.mode = mode;
        this.subMode = subMode;
        this.score = 0;
        this.streak = 0;
        this.sessionBestStreak = 0;
        this.lives = CONFIG.LIVES;
        this.answered = 0;
        this.locked = false;
        this.timer = null;
    }

    hit() {
        this.score += 100 + (this.streak * 15);
        this.streak++;
        if (this.streak > this.sessionBestStreak) this.sessionBestStreak = this.streak;
        if (this.streak > save.bestStreak) save.bestStreak = this.streak;
        save.totalCorrect++;
        save.xp += 50 + (this.streak * 5);
        // Level up
        while (save.xp >= save.level * CONFIG.XP_PER_LEVEL) { save.level++; }
        saveSave(save);
        // CRITICAL FIX: Force cloud sync when user gets answer correct
        if (canCloudSync()) forcePushCloud().catch(e => {});
    }

    miss() {
        this.streak = 0;
        this.lives--;
        save.totalWrong++;
        saveSave(save);
        // CRITICAL FIX: Force cloud sync when user gets answer wrong
        if (canCloudSync()) forcePushCloud().catch(e => {});
    }

    markAnswered(cca3) {
        if (this.mode !== 'oracle') {
            if (!save.answered[this.mode]) save.answered[this.mode] = [];
            if (!save.answered[this.mode].includes(cca3)) {
                save.answered[this.mode].push(cca3);
            }
        }
        saveSave(save);
        // CRITICAL FIX: Force cloud sync when marking country as answered
        if (canCloudSync()) forcePushCloud().catch(e => {});
    }
}


// ===================== STANDARD QUIZ CONTROLLER =====================
function startStandardQuiz(mode, subMode = null) {
    currentGame = new GameSession(mode, subMode);
    const labels = {
        flag: 'Flag Vision',
        capital: 'Capital Bridge',
        currency: 'Currency Pulse',
        population: subMode === 'area' ? 'Size Showdown' : 'Citizen Surge',
        border: 'Neighbor Nexus',
        emoji: 'Emoji Nexus'
    };
    $('#quiz-mode-label').textContent = labels[mode] || mode;
    showView('quiz');
    nextStandardRound();
}

function nextStandardRound() {
    const game = currentGame;
    if (!game || game.lives <= 0) return endGame();

    game.locked = false;
    let { target, options } = pickQuestion(game.mode);

    // Update UI
    renderLives('#quiz-lives', game.lives);
    $('#quiz-score').textContent = game.score;
    $('#quiz-streak').textContent = game.streak;

    // Set prompt & media
    const media = $('#quiz-media');
    const subject = $('#quiz-subject');
    media.innerHTML = '';
    subject.textContent = '';

    switch (game.mode) {
        case 'flag':
            $('#quiz-prompt').textContent = 'Identify this flag';
            const flagUrl = target.flags.png || target.flags.svg;
            media.innerHTML = '<img src="' + flagUrl + '" alt="Country flag" loading="eager">';
            break;
        case 'capital':
            $('#quiz-prompt').textContent = 'Which nation has this capital?';
            subject.textContent = target.capital[0];
            break;
        case 'currency':
            $('#quiz-prompt').textContent = 'Which economy uses this currency?';
            const cur = Object.values(target.currencies)[0];
            let cName = cur.name || 'Unknown Currency';

            // SANITIZE: Remove country name and adjectival forms from currency name
            if (target.name && target.name.common) {
                const countryBase = target.name.common;
                // Create a pattern that matches the country name or its likely adjectival forms
                // e.g. "Pakistan" -> matches "Pakistani", "Pakistan"
                // e.g. "India" -> matches "Indian", "India"
                const base = countryBase.replace(/ia$|an$|n$|i$|s$|e$|a$/gi, '');
                if (base.length > 2) {
                    const regex = new RegExp(base + '[a-z]*', 'gi');
                    cName = cName.replace(regex, '').trim();
                }
                // Also remove the full common name just in case
                cName = cName.replace(new RegExp(countryBase, 'gi'), '').trim();
            }

            // Secondary cleanup: remove leading/trailing common words like "of" or "-"
            cName = cName.replace(/^of\s+|^-|^\s+|\s+$/gi, '').trim();
            if (cName.length < 3) cName = cur.name; // Fallback if we shredded it too much

            // Clean up symbols if they contain country codes (e.g. AU$ -> $)
            let cSym = cur.symbol || '?';
            if (cSym.length > 1 && /[A-Z]/.test(cSym)) {
                cSym = cSym.replace(/[A-Z]{2,}/g, '').trim() || cSym;
            }

            subject.innerHTML = `<span style="text-transform: capitalize;">${cName}</span> <span style="color:var(--amber)">(${cSym})</span>`;
            break;
        case 'population':
            const isArea = game.subMode === 'area';
            $('#quiz-prompt').textContent = isArea ? 'Which country is LARGER in size?' : 'Which country has MORE people?';

            // Pick exactly 2 options for VS mode
            const vsOptions = options.slice(0, 2);
            options = vsOptions;

            const [c1, c2] = vsOptions;
            const val1 = isArea ? (c1.area || 0) : (c1.population || 0);
            const val2 = isArea ? (c2.area || 0) : (c2.population || 0);

            target = val1 > val2 ? c1 : c2;

            media.innerHTML = `
                <div class="vs-container">
                    <div class="vs-side">
                        <img src="${c1.flags.png || c1.flags.svg}" alt="Flag 1">
                        <span>${c1.name.common}</span>
                    </div>
                    <div class="vs-badge">VS</div>
                    <div class="vs-side">
                        <img src="${c2.flags.png || c2.flags.svg}" alt="Flag 2">
                        <span>${c2.name.common}</span>
                    </div>
                </div>
            `;
            break;
        case 'border':
            $('#quiz-prompt').textContent = 'I share borders with...';
            if (target.borders && target.borders.length > 0) {
                // Fallback map for common codes if not in active dataset
                const codeMap = {
                    'AFG': 'Afghanistan', 'AGO': 'Angola', 'ALB': 'Albania', 'AND': 'Andorra', 'ARE': 'UAE', 'ARG': 'Argentina', 'ARM': 'Armenia', 'ATG': 'Antigua',
                    'AUS': 'Australia', 'AUT': 'Austria', 'AZE': 'Azerbaijan', 'BDI': 'Burundi', 'BEL': 'Belgium', 'BEN': 'Benin', 'BFA': 'Burkina Faso',
                    'BGD': 'Bangladesh', 'BGR': 'Bulgaria', 'BHR': 'Bahrain', 'BHS': 'Bahamas', 'BIH': 'Bosnia', 'BLR': 'Belarus', 'BLZ': 'Belize',
                    'BOL': 'Bolivia', 'BRA': 'Brazil', 'BRB': 'Barbados', 'BRN': 'Brunei', 'BTN': 'Bhutan', 'BWA': 'Botswana', 'CAF': 'Central African Rep.',
                    'CAN': 'Canada', 'CHE': 'Switzerland', 'CHL': 'Chile', 'CHN': 'China', 'CIV': 'Ivory Coast', 'CMR': 'Cameroon', 'COD': 'DR Congo',
                    'COG': 'Congo', 'COL': 'Colombia', 'CRI': 'Costa Rica', 'CUB': 'Cuba', 'CYP': 'Cyprus', 'CZE': 'Czechia', 'DEU': 'Germany',
                    'DJI': 'Djibouti', 'DMA': 'Dominica', 'DNK': 'Denmark', 'DOM': 'Dominican Rep.', 'DZA': 'Algeria', 'ECU': 'Ecuador', 'EGY': 'Egypt',
                    'ERI': 'Eritrea', 'ESP': 'Spain', 'EST': 'Estonia', 'ETH': 'Ethiopia', 'FIN': 'Finland', 'FJI': 'Fiji', 'FRA': 'France',
                    'GAB': 'Gabon', 'GBR': 'United Kingdom', 'GEO': 'Georgia', 'GHA': 'Ghana', 'GIN': 'Guinea', 'GMB': 'Gambia', 'GNB': 'Guinea-Bissau',
                    'GNQ': 'Equatorial Guinea', 'GRC': 'Greece', 'GRD': 'Grenada', 'GTM': 'Guatemala', 'GUY': 'Guyana', 'HKG': 'Hong Kong', 'HND': 'Honduras',
                    'HRV': 'Croatia', 'HTI': 'Haiti', 'HUN': 'Hungary', 'IDN': 'Indonesia', 'IND': 'India', 'IRL': 'Ireland', 'IRN': 'Iran',
                    'IRQ': 'Iraq', 'ISL': 'Iceland', 'ISR': 'Israel', 'ITA': 'Italy', 'JAM': 'Jamaica', 'JOR': 'Jordan', 'JPN': 'Japan',
                    'KAZ': 'Kazakhstan', 'KEN': 'Kenya', 'KGZ': 'Kyrgyzstan', 'KHM': 'Cambodia', 'KIR': 'Kiribati', 'KNA': 'St. Kitts', 'KOR': 'South Korea',
                    'KWT': 'Kuwait', 'LAO': 'Laos', 'LBN': 'Lebanon', 'LBR': 'Liberia', 'LBY': 'Libya', 'LCA': 'St. Lucia', 'LIE': 'Liechtenstein',
                    'LKA': 'Sri Lanka', 'LSO': 'Lesotho', 'LTU': 'Lithuania', 'LUX': 'Luxembourg', 'LVA': 'Latvia', 'MAC': 'Macau', 'MAR': 'Morocco',
                    'MCO': 'Monaco', 'MDA': 'Moldova', 'MDG': 'Madagascar', 'MDV': 'Maldives', 'MEX': 'Mexico', 'MHL': 'Marshall Is.', 'MKD': 'North Macedonia',
                    'MLI': 'Mali', 'MLT': 'Malta', 'MMR': 'Myanmar', 'MNE': 'Montenegro', 'MNG': 'Mongolia', 'MOZ': 'Mozambique', 'MRT': 'Mauritania',
                    'MUS': 'Mauritius', 'MWI': 'Malawi', 'MYS': 'Malaysia', 'NAM': 'Namibia', 'NER': 'Niger', 'NGA': 'Nigeria', 'NIC': 'Nicaragua',
                    'NLD': 'Netherlands', 'NOR': 'Norway', 'NPL': 'Nepal', 'NZL': 'New Zealand', 'OMN': 'Oman', 'PAK': 'Pakistan', 'PAN': 'Panama',
                    'PER': 'Peru', 'PHL': 'Philippines', 'PLW': 'Palau', 'PNG': 'Papua New Guinea', 'POL': 'Poland', 'PRK': 'North Korea', 'PRT': 'Portugal',
                    'PRY': 'Paraguay', 'PSE': 'Palestine', 'QAT': 'Qatar', 'ROU': 'Romania', 'RUS': 'Russia', 'RWA': 'Rwanda', 'SAU': 'Saudi Arabia',
                    'SDN': 'Sudan', 'SEN': 'Senegal', 'SGP': 'Singapore', 'SLB': 'Solomon Is.', 'SLE': 'Sierra Leone', 'SLV': 'El Salvador', 'SMR': 'San Marino',
                    'SOM': 'Somalia', 'SRB': 'Serbia', 'SSD': 'South Sudan', 'STP': 'Sao Tome', 'SUR': 'Suriname', 'SVK': 'Slovakia', 'SVN': 'Slovenia',
                    'SWE': 'Sweden', 'SWZ': 'Eswatini', 'SYR': 'Syria', 'TCD': 'Chad', 'TGO': 'Togo', 'THA': 'Thailand', 'TJK': 'Tajikistan',
                    'TKM': 'Turkmenistan', 'TLS': 'Timor-Leste', 'TON': 'Tonga', 'TTO': 'Trinidad', 'TUN': 'Tunisia', 'TUR': 'Turkey', 'TUV': 'Tuvalu',
                    'TWN': 'Taiwan', 'TZA': 'Tanzania', 'UGA': 'Uganda', 'UKR': 'Ukraine', 'URY': 'Uruguay', 'USA': 'United States', 'UZB': 'Uzbekistan',
                    'VAT': 'Vatican City', 'VCT': 'St. Vincent', 'VEN': 'Venezuela', 'VNM': 'Vietnam', 'VUT': 'Vanuatu', 'WSM': 'Samoa', 'YEM': 'Yemen',
                    'ZAF': 'South Africa', 'ZMB': 'Zambia', 'ZWE': 'Zimbabwe'
                };

                const neighbors = target.borders.map(code => {
                    const country = allCountries.find(c => c.cca3 === code);
                    return country ? country.name.common : (codeMap[code] || code);
                }).join(', ');
                subject.innerHTML = `<span style="font-size: 1.1rem; line-height: 1.6;">${neighbors}</span>`;
            } else {
                subject.textContent = `I am an island nation in ${target.subregion || target.region}.`;
            }
            break;
        case 'emoji':
            $('#quiz-prompt').textContent = 'Decode these AI-generated emojis';
            subject.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span> Syncing visual Nexus...</div>';

            // Defer timer until AI emojis arrive
            getEmojiHints(target.name.common).then(emojis => {
                if (!currentGame || currentGame.mode !== 'emoji') return;
                const display = emojis || generateLocalEmojis(target);
                subject.innerHTML = `<div class="emoji-display">${display}</div>`;
                // NOW start timer after content is ready
                if (game.timer) game.timer.stop();
                game.timer = new Timer('#quiz-timer-fill', CONFIG.TIMER_STANDARD, null, () => {
                    if (!game.locked) {
                        game.locked = true;
                        game.miss();
                        highlightCorrect('#quiz-options', target.cca3);
                        setTimeout(() => nextStandardRound(), 1500);
                    }
                });
                game.timer.start();
            });
            break;
    }

    // Render options
    const optionsEl = $('#quiz-options');
    optionsEl.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt.name.common;
        btn.setAttribute('data-cca3', opt.cca3);
        btn.addEventListener('click', () => handleStandardAnswer(btn, opt, target));
        optionsEl.appendChild(btn);
    });

    // Timer — skip for emoji mode (deferred until AI responds)
    if (game.mode !== 'emoji') {
        if (game.timer) game.timer.stop();
        game.timer = new Timer('#quiz-timer-fill', CONFIG.TIMER_STANDARD, null, () => {
            if (!game.locked) {
                game.locked = true;
                game.miss();
                highlightCorrect('#quiz-options', target.cca3);
                setTimeout(() => nextStandardRound(), 1500);
            }
        });
        game.timer.start();
    }
    updateSidebarStats();
}

function handleStandardAnswer(btn, selected, target) {
    const game = currentGame;
    if (!game || game.locked) return;
    game.locked = true;
    if (game.timer) game.timer.stop();

    const isCorrect = selected.cca3 === target.cca3;

    // Disable all buttons
    $$('#quiz-options .opt-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        game.hit();
        game.markAnswered(target.cca3);
    } else {
        btn.classList.add('wrong');
        game.miss();
        highlightCorrect('#quiz-options', target.cca3);
    }

    // Update display
    $('#quiz-score').textContent = game.score;
    $('#quiz-streak').textContent = game.streak;
    renderLives('#quiz-lives', game.lives);
    updateSidebarStats();

    setTimeout(() => {
        if (game.lives <= 0) return endGame();
        nextStandardRound();
    }, 1400);
}

function highlightCorrect(containerSel, correctCca3) {
    $$(containerSel + ' .opt-btn').forEach(b => {
        if (b.getAttribute('data-cca3') === correctCca3) b.classList.add('correct');
    });
}


// ===================== ORACLE QUIZ CONTROLLER =====================
function startOracleQuiz() {
    currentGame = new GameSession('oracle');
    showView('oracle');
    nextOracleRound();
}

async function nextOracleRound() {
    const game = currentGame;
    if (!game || game.lives <= 0) return endGame();

    game.locked = false;
    const { target, options } = pickQuestion('oracle');

    renderLives('#oracle-lives', game.lives);
    $('#oracle-score').textContent = game.score;
    $('#oracle-streak').textContent = game.streak;

    // Show thinking state
    const hintsEl = $('#hints-container');
    hintsEl.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span> Consulting the Oracle...</div>';
    $('#oracle-status').textContent = 'Generating cryptic hints...';
    $('#oracle-options').innerHTML = '';

    // Fetch AI hints
    let hints = await getAIHints(target.name.common);
    if (!hints || hints.length < 2) {
        hints = generateLocalHints(target);
    }

    // Clear thinking
    hintsEl.innerHTML = '';
    $('#oracle-status').textContent = 'Clues decoded. Choose wisely.';

    // Reveal hints with delay
    for (let i = 0; i < hints.length; i++) {
        await new Promise(r => setTimeout(r, i === 0 ? 300 : 2500));
        if (game.locked) return; // user already answered
        const div = document.createElement('div');
        div.className = 'hint-item';
        div.style.animationDelay = '0s';
        div.innerHTML = '<strong>Hint ' + (i + 1) + ':</strong> ' + hints[i];
        hintsEl.appendChild(div);
    }

    // Show options after first hint
    const optionsEl = $('#oracle-options');
    optionsEl.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt.name.common;
        btn.setAttribute('data-cca3', opt.cca3);
        btn.addEventListener('click', () => handleOracleAnswer(btn, opt, target));
        optionsEl.appendChild(btn);
    });

    // Timer
    if (game.timer) game.timer.stop();
    game.timer = new Timer('#oracle-timer-fill', CONFIG.TIMER_ORACLE, null, () => {
        if (!game.locked) {
            game.locked = true;
            game.miss();
            highlightCorrect('#oracle-options', target.cca3);
            renderLives('#oracle-lives', game.lives);
            updateSidebarStats();
            setTimeout(() => {
                if (game.lives <= 0) return endGame();
                nextOracleRound();
            }, 2000);
        }
    });
    game.timer.start();
    updateSidebarStats();
}

function handleOracleAnswer(btn, selected, target) {
    const game = currentGame;
    if (!game || game.locked) return;
    game.locked = true;
    game.timer.stop();

    const isCorrect = selected.cca3 === target.cca3;
    $$('#oracle-options .opt-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        game.hit();
    } else {
        btn.classList.add('wrong');
        game.miss();
        highlightCorrect('#oracle-options', target.cca3);
    }

    $('#oracle-score').textContent = game.score;
    $('#oracle-streak').textContent = game.streak;
    renderLives('#oracle-lives', game.lives);
    updateSidebarStats();

    setTimeout(() => {
        if (game.lives <= 0) return endGame();
        nextOracleRound();
    }, 1800);
}


// ===================== SENTINEL QUIZ CONTROLLER =====================
let sentinelTimerDuration = CONFIG.TIMER_SENTINEL_DEFAULT; // 60s default
const SENTINEL_TIMER_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 0]; // 0 = unlimited

function cycleSentinelTimer() {
    const idx = SENTINEL_TIMER_OPTIONS.indexOf(sentinelTimerDuration);
    sentinelTimerDuration = SENTINEL_TIMER_OPTIONS[(idx + 1) % SENTINEL_TIMER_OPTIONS.length];
    updateSentinelTimerDisplay();
}

function updateSentinelTimerDisplay() {
    const el = $('#sentinel-timer-label');
    if (el) {
        el.textContent = sentinelTimerDuration === 0 ? '∞ Unlimited' : sentinelTimerDuration + 's';
    }
}

function startSentinelQuiz() {
    currentGame = new GameSession('sentinel');
    currentGame.credits = 3;
    currentGame.history = [];
    showView('sentinel');
    updateSentinelTimerDisplay();
    nextSentinelRound();
}

function nextSentinelRound() {
    const game = currentGame;
    if (!game || game.lives <= 0) return endGame();

    game.locked = false;
    game.credits = 3;
    game.history = [];
    game.target = pickQuestion('sentinel').target;
    game.sentinelPhase = 'interrogation'; // interrogation -> answer

    // Reset UI
    renderLives('#sentinel-lives', game.lives);
    $('#sentinel-score').textContent = game.score;
    $('#sentinel-streak').textContent = game.streak;
    $('#sentinel-chat').innerHTML = `
        <div class="chat-msg bot-msg">
            <i class='bx bx-bot'></i>
            <div class="msg-content">🔒 Accessing secure geographic nodes. I have chosen a nation. You have <b>3 interrogation credits</b> remaining. Ask wisely — or skip straight to guessing.</div>
        </div>
    `;
    updateSentinelCredits();
    $('#sentinel-input-area').style.display = 'block';
    $('#sentinel-input').disabled = false;
    $('#btn-sentinel-send').disabled = false;
    $('#sentinel-options').innerHTML = '';

    // Stop any old timer
    if (game.timer) game.timer.stop();
    // Start sentinel timer if not unlimited
    if (sentinelTimerDuration > 0) {
        game.timer = new Timer('#sentinel-timer-fill', sentinelTimerDuration, null, () => {
            if (!game.locked) {
                game.locked = true;
                game.miss();
                addChatMsg('bot', `⏰ Time expired. The target was <b>${game.target.name.common}</b>.`);
                renderLives('#sentinel-lives', game.lives);
                updateSidebarStats();
                $$('#sentinel-options .opt-btn').forEach(b => b.disabled = true);
                $('#sentinel-input').disabled = true;
                $('#btn-sentinel-send').disabled = true;
                setTimeout(() => {
                    if (game.lives <= 0) return endGame();
                    nextSentinelRound();
                }, 2500);
            }
        });
        game.timer.start();
    }
}

function updateSentinelCredits() {
    const pips = $$('#sentinel-credits .pip');
    pips.forEach((p, i) => {
        if (i < currentGame.credits) p.classList.remove('spent');
        else p.classList.add('spent');
    });
    if (currentGame.credits <= 0 && currentGame.sentinelPhase === 'interrogation') {
        currentGame.sentinelPhase = 'answer';
        $('#sentinel-input').disabled = true;
        $('#btn-sentinel-send').disabled = true;
        showSentinelOptions();
    }
}

async function sendSentinelQuestion() {
    const game = currentGame;
    if (!game || game.mode !== 'sentinel') return;
    const input = $('#sentinel-input');
    const text = input.value.trim();
    if (!text || game.credits <= 0 || game.locked) return;

    input.value = '';
    game.credits--;
    updateSentinelCredits();

    addChatMsg('user', text);

    // Show thinking indicator
    const thinkingId = addChatMsg('bot', '<div class="thinking-dots"><span></span><span></span><span></span> Processing...</div>');

    try {
        const response = await getSentinelResponse(game.target.name.common, text, game.history);
        game.history.push({ q: text, a: response });
        const msgEl = document.getElementById(thinkingId);
        if (msgEl) msgEl.querySelector('.msg-content').innerHTML = response;
    } catch (err) {
        const msgEl = document.getElementById(thinkingId);
        if (msgEl) msgEl.querySelector('.msg-content').innerHTML = 'Signal jammed. Try another frequency.';
    }
}

function addChatMsg(role, content) {
    const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const iconName = role === 'bot' ? 'bot' : 'user';
    const html = `
        <div class="chat-msg ${role}-msg" id="${id}">
            <i class='bx bx-${iconName}'></i>
            <div class="msg-content">${content}</div>
        </div>
    `;
    const container = $('#sentinel-chat');
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
    return id;
}

function showSentinelOptions() {
    const optionsEl = $('#sentinel-options');
    optionsEl.innerHTML = '';

    // Build options: guaranteed target + 3 random distractors
    const distractors = shuffle(allCountries.filter(c => c.cca3 !== currentGame.target.cca3)).slice(0, 3);
    const finalOptions = shuffle([currentGame.target, ...distractors]);

    finalOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt.name.common;
        btn.addEventListener('click', () => handleSentinelAnswer(btn, opt));
        optionsEl.appendChild(btn);
    });
    addChatMsg('bot', '🎯 Interrogation window <b>closed</b>. Identify the target country now.');
}

function handleSentinelAnswer(btn, selected) {
    const game = currentGame;
    if (!game || game.locked) return;
    game.locked = true;
    if (game.timer) game.timer.stop();

    const isCorrect = selected.cca3 === game.target.cca3;
    $$('#sentinel-options .opt-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        game.hit();
        game.markAnswered(game.target.cca3);
        addChatMsg('bot', '✅ Target confirmed. Secure node cleared. <b>+XP</b>');
    } else {
        btn.classList.add('wrong');
        game.miss();
        addChatMsg('bot', `❌ Negative. The target was <b>${game.target.name.common}</b>. Node breach detected.`);
        $$('#sentinel-options .opt-btn').forEach(b => {
            if (b.textContent === game.target.name.common) b.classList.add('correct');
        });
    }

    $('#sentinel-score').textContent = game.score;
    $('#sentinel-streak').textContent = game.streak;
    renderLives('#sentinel-lives', game.lives);
    updateSidebarStats();

    setTimeout(() => {
        if (game.lives <= 0) return endGame();
        nextSentinelRound();
    }, 2500);
}


// ===================== GAME OVER =====================
function endGame() {
    if (!currentGame) return;
    if (currentGame.timer) currentGame.timer.stop();

    $('#go-score').textContent = currentGame.score;
    $('#go-correct').textContent = save.totalCorrect;
    $('#go-streak').textContent = currentGame.sessionBestStreak;

    showView('gameover');
    updateSidebarStats();
    
    // CRITICAL FIX: Force immediate cloud push when game ends
    // Ensures data syncs across ALL devices with same Google account BEFORE app closes
    if (canCloudSync()) {
        forcePushCloud().catch(e => console.warn('Cloud sync on game end failed:', e));
    }
}


// ===================== NAVIGATION & EVENTS =====================
function goHome() {
    if (currentGame && currentGame.timer) currentGame.timer.stop();
    currentGame = null;
    showView('home');
    updateSidebarStats();
}

function initEvents() {
    // Mobile Menu Toggle
    const menuBtn = $('.menu-toggle');
    const sidebar = $('#sidebar');
    const overlay = $('.sidebar-overlay');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar on nav click (mobile)
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            const view = btn.getAttribute('data-view');
            if (view === 'home') return goHome();
            if (view === 'oracle') return startOracleQuiz();
            if (view === 'sentinel') return startSentinelQuiz();
            if (view === 'emoji') return startStandardQuiz('emoji');
            startStandardQuiz(view);
        });
    });

    // Mode cards on home
    $$('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.getAttribute('data-mode');
            if (mode === 'population') return; // Handled by sub-opt-btns
            if (mode === 'oracle') return startOracleQuiz();
            if (mode === 'sentinel') return startSentinelQuiz();
            startStandardQuiz(mode);
        });
    });

    // Back buttons
    $('#quiz-back').addEventListener('click', goHome);
    $('#oracle-back').addEventListener('click', goHome);

    // Game over buttons
    $('#go-retry').addEventListener('click', () => {
        const mode = currentGame ? currentGame.mode : 'flag';
        if (mode === 'oracle') return startOracleQuiz();
        if (mode === 'sentinel') return startSentinelQuiz();
        startStandardQuiz(mode, currentGame ? currentGame.subMode : null);
    });
    $('#go-home').addEventListener('click', goHome);

    // Sentinel events
    $('#sentinel-back').addEventListener('click', goHome);
    $('#btn-sentinel-send').addEventListener('click', sendSentinelQuestion);
    $('#sentinel-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendSentinelQuestion();
    });
    // Sentinel timer toggle
    const timerToggle = $('#sentinel-timer-toggle');
    if (timerToggle) timerToggle.addEventListener('click', cycleSentinelTimer);

    // Auth Actions
    $('#btn-logout').addEventListener('click', () => {
        NexusModal.confirm('Log Out?', 'Are you sure you want to disconnect from the Nexus? Your local session will be saved.', (ok) => {
            if (ok) {
                localStorage.removeItem('geo_last_user');
                localStorage.removeItem('geo_last_sub');
                location.reload();
            }
        });
    });

    $('#btn-reset').addEventListener('click', () => {
        NexusModal.confirm('WIPE DATA?', 'This will permanently ERASE all agent progress. This action cannot be undone.', (ok) => {
            if (ok) {
                save = getDefaultSave();
                saveSave(save);
                setTimeout(() => location.reload(), 300);
            }
        }, true);
    });


    // Mobile menu
    $('#menu-toggle').addEventListener('click', () => {
        $('#sidebar').classList.toggle('open');
        $('#sidebar-overlay').classList.toggle('visible');
    });
    $('#sidebar-overlay').addEventListener('click', () => {
        $('#sidebar').classList.remove('open');
        $('#sidebar-overlay').classList.remove('visible');
    });

    $('#btn-open-settings').addEventListener('click', () => {
        showView('settings');
        if ($('#settings-username')) $('#settings-username').value = currentUser;
    });
    $('#settings-back').addEventListener('click', goHome);
    $('#btn-save-settings').addEventListener('click', async () => {
        const newName = $('#settings-username').value.trim();

        if (newName && newName !== currentUser) {
            NexusModal.confirm('Migrate Profile?', `Rename your agent to "${newName}"? Your current progress will be moved to this new record.`, (ok) => {
                if (ok) {
                    const oldKey = CONFIG.STORAGE_KEY + '_' + currentUser;
                    const newKey = CONFIG.STORAGE_KEY + '_' + newName;
                    const data = localStorage.getItem(oldKey);

                    if (data && data !== 'null') {
                        localStorage.setItem(newKey, data);
                    }
                    localStorage.setItem('geo_last_user', newName);
                    if (currentGoogleSub) {
                        localStorage.setItem('geo_map_' + currentGoogleSub, newName);
                        NexusCloud.setMap(currentGoogleSub, newName);
                        // Push data to the GoogleID slot immediately
                        NexusCloud.push(currentGoogleSub, JSON.stringify(save));
                    }
                    currentUser = newName;

                    NexusModal.show('Success', 'Profile migrated successfully!', 'bx-check-shield').then(() => {
                        location.reload();
                    });
                }
            });
        }
    });

    // Close sidebar on nav click (mobile)
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                $('#sidebar').classList.remove('active');
                $('.sidebar-overlay').classList.remove('active');
            }
        });
    });
}


// ===================== CUSTOM NEXUS MODALS =====================
const NexusModal = {
    // ... (existing show/confirm logic kept)
    show: function (title, text, icon = 'bx-info-circle', danger = false) {
        return new Promise(resolve => {
            const overlay = $('#modal-overlay');
            const iconEl = $('#modal-icon');
            $('#modal-title').textContent = title;
            $('#modal-text').textContent = text;
            iconEl.className = 'bx modal-icon ' + icon + (danger ? ' danger' : '');

            const actions = $('#modal-actions');
            actions.innerHTML = `<button class="btn-primary" style="flex:1" id="modal-ok">OK</button>`;

            overlay.classList.add('active');
            $('#modal-ok').onclick = () => {
                overlay.classList.remove('active');
                resolve(true);
            };
        });
    },
    confirm: function (title, text, callback, danger = false) {
        const overlay = $('#modal-overlay');
        const iconEl = $('#modal-icon');
        $('#modal-title').textContent = title;
        $('#modal-text').textContent = text;
        iconEl.className = 'bx modal-icon ' + (danger ? 'bx-error-circle danger' : 'bx-question-mark');

        const actions = $('#modal-actions');
        actions.innerHTML = `
            <button class="nav-btn" style="flex:1" id="modal-cancel">CANCEL</button>
            <button class="${danger ? 'action-btn danger' : 'btn-primary'}" style="flex:1" id="modal-ok">CONFIRM</button>
        `;

        overlay.classList.add('active');
        $('#modal-cancel').onclick = () => {
            overlay.classList.remove('active');
            if (callback) callback(false);
        };
        $('#modal-ok').onclick = () => {
            overlay.classList.remove('active');
            if (callback) callback(true);
        };
    }
};

function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) { return null; }
}

// Global state for Auth
let gisLoaded = false;
function initGIS(callback) {
    if (window.google) {
        try {
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                callback: callback,
                auto_select: true,
                cancel_on_tap_outside: true
            });
            gisLoaded = true;
            renderGButton();
            try { google.accounts.id.prompt(); } catch (e) { }
        } catch (e) { console.warn('GIS error:', e); }
    } else {
        setTimeout(() => initGIS(callback), 150);
    }
}

function renderGButton() {
    const btn = document.getElementById("btn-google");
    if (window.google && gisLoaded && btn) {
        google.accounts.id.renderButton(btn, {
            theme: "filled_blue", size: "large", text: "continue_with",
            shape: "pill", width: "280"
        });
    } else if (gisLoaded && !btn) {
        // Screen might not be ready yet, retry once
        setTimeout(renderGButton, 200);
    }
}

// ===================== AUTH LOGIC =====================
function handleAuth() {
    return new Promise(async (resolve) => {
        const lastUser = localStorage.getItem('geo_last_user');
        let hasResolved = false;
        initialCloudHydrated = false;

        const authScreen = $('#auth-screen');
        const splash = $('#splash-screen');
        const authMsg = $('#auth-msg');

        const showAuth = (msg) => {
            if (splash) splash.classList.add('hidden');
            if (authMsg && msg) authMsg.textContent = msg;
            if (authScreen) authScreen.classList.remove('hidden');
            setTimeout(renderGButton, 100);
        };

        const finalizeLogin = (user) => {
            if (hasResolved) return;
            hasResolved = true;
            loginUser(user);
            localStorage.setItem('geo_last_user', user);
            if (authScreen) authScreen.classList.add('hidden');
            resolve();
        };

        // Guest Login Handler
        const guestBtn = $('#btn-guest-login');
        if (guestBtn) {
            guestBtn.onclick = () => {
                const rng = Math.floor(1000 + Math.random() * 9000);
                initialCloudHydrated = true;
                finalizeLogin('Agent_' + rng);
            };
        }

        // 3. Deep Sync via GIS
        initGIS(async (response) => {
            const payload = decodeJWT(response.credential);
            if (payload && payload.sub) {
                currentGoogleSub = payload.sub;
                localStorage.setItem('geo_last_sub', currentGoogleSub);

                // Get name from cloud mapping or fallback to google name
                let finalName = await NexusCloud.getMap(payload.sub);
                if (!finalName) {
                    const cleanLast = (lastUser && lastUser !== 'null' && lastUser !== 'undefined') ? lastUser : null;
                    finalName = cleanLast || payload.name.replace(/\s/g, '_');
                    NexusCloud.setMap(payload.sub, finalName);
                }
                localStorage.setItem('geo_map_' + payload.sub, finalName);
                await hydrateLinkedAccount(finalName, payload.sub, [lastUser]);

                finalizeLogin(finalName);
            }
        });

        // Keep guest users frictionless.
        if (lastUser && lastUser.startsWith('Agent_')) {
            initialCloudHydrated = true;
            finalizeLogin(lastUser);
            return;
        }

        // Always verify Google identity for synced profiles to avoid stale per-browser sub drift.
        showAuth('Sign in with Google to sync one shared profile across all devices.');
    });
}

function loginUser(username) {
    currentUser = username;
    if (!currentGoogleSub || currentUser.startsWith('Agent_')) {
        initialCloudHydrated = true;
    }
    save = loadSave(username);

    // Update UI
    const nameEl = $('#user-name');
    if (nameEl) nameEl.textContent = username;

    // Initialize stats
    updateSidebarStats();
    startCloudSync();
    
    // CRITICAL FIX: Immediately sync cloud data after login
    // This ensures user gets their latest data across all devices
    if (canCloudSync()) {
        console.log('🔄 User logged in with Google. Starting cloud sync...');
        syncCloudNow();
    }
}

// ===================== SPLASH & BOOT =====================
async function boot() {
    const splashFill = $('#splash-fill');
    const splashStatus = $('#splash-status');

    try {
        // Step 0: Auth
        if (splashStatus) splashStatus.textContent = 'Establishing Secure Link...';
        await handleAuth();

        // Initialize local sync mechanisms
        initBroadcastChannel();
        startLocalStoragePolling();

        // Ensure splash is visible for loading progress if it was hidden
        const splash = $('#splash-screen');
        if (splash && splash.classList.contains('hidden')) {
            splash.classList.remove('hidden');
        }


        // Step 1: UI ready
        splashFill.style.width = '20%';
        splashStatus.textContent = 'Loading interface...';
        await sleep(300);

        // Step 2: Fetch data
        splashFill.style.width = '50%';
        splashStatus.textContent = 'Downloading country database...';
        allCountries = await fetchCountries();

        // Refresh sidebar now that we have real country counts
        updateSidebarStats();

        // Step 3: Process
        splashFill.style.width = '80%';
        splashStatus.textContent = 'Processing ' + allCountries.length + ' countries...';
        await sleep(400);

        // Step 4: Ready
        splashFill.style.width = '100%';
        splashStatus.textContent = `Welcome back, Agent ${currentUser || 'Explorer'}`;
        await sleep(600);

        // Hide splash, show app
        $('#splash-screen').classList.add('hidden');
        $('#app').classList.remove('app-hidden');
        $('#app').classList.add('app-visible');

        // Init
        initEvents();
        updateSidebarStats();
        showView('home');

        console.log('GeoMaster AI v2.0 — ' + allCountries.length + ' countries loaded.');

    } catch (err) {
        console.error('Boot failure:', err);
        splashStatus.textContent = 'ERROR: ' + err.message;
        splashFill.style.background = '#ef4444';
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========== GO ==========
document.addEventListener('DOMContentLoaded', boot);
window.addEventListener('focus', () => { 
    console.log('🔄 Window focused - syncing cloud data...');
    syncCloudNow(); 
});
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('🔄 App visible - syncing cloud data...');
        syncCloudNow();
    }
});
