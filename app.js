/* =============================================================
   GEOMASTER AI v2.0 — Complete Application Core
   Single-file architecture for maximum compatibility.
   ============================================================= */

// ===================== CONFIGURATION =====================
const CONFIG = {
    API_COUNTRY: 'https://restcountries.com/v3.1/all?fields=name,cca3,capital,flags,currencies,region,subregion,population,independent,borders,area',
    API_AI: 'https://openrouter.ai/api/v1/chat/completions',
    AI_KEY: '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',
    AI_MODEL: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    TIMER_STANDARD: 15,   // seconds
    TIMER_ORACLE: 40,
    TIMER_SENTINEL_DEFAULT: 60,
    LIVES: 3,
    XP_PER_LEVEL: 1000,
    OPTIONS_COUNT: 4,
    STORAGE_KEY: 'geomaster_ai_save',
    GOOGLE_CLIENT_ID: '481536087745-nujuqgrspms7u05amp2k77a8982gst59.apps.googleusercontent.com'
};

// ===================== FALLBACK DATA (50 countries) =====================
const FALLBACK_COUNTRIES = [
    { name: { common: "France" }, cca3: "FRA", capital: ["Paris"], flags: { svg: "https://flagcdn.com/fr.svg", png: "https://flagcdn.com/w320/fr.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Western Europe", population: 67390000, independent: true, borders: ["ESP", "AND", "BEL", "LUX", "DEU", "CHE", "ITA", "MCO"] },
    { name: { common: "Japan" }, cca3: "JPN", capital: ["Tokyo"], flags: { svg: "https://flagcdn.com/jp.svg", png: "https://flagcdn.com/w320/jp.png" }, currencies: { JPY: { name: "Japanese yen", symbol: "¥" } }, region: "Asia", subregion: "Eastern Asia", population: 125800000, independent: true, borders: [] },
    { name: { common: "Brazil" }, cca3: "BRA", capital: ["Brasília"], flags: { svg: "https://flagcdn.com/br.svg", png: "https://flagcdn.com/w320/br.png" }, currencies: { BRL: { name: "Brazilian real", symbol: "R$" } }, region: "Americas", subregion: "South America", population: 213900000, independent: true, borders: ["ARG", "BOL", "COL", "GUF", "GUY", "PRY", "PER", "SUR", "URY", "VEN"] },
    { name: { common: "United States" }, cca3: "USA", capital: ["Washington, D.C."], flags: { svg: "https://flagcdn.com/us.svg", png: "https://flagcdn.com/w320/us.png" }, currencies: { USD: { name: "United States dollar", symbol: "$" } }, region: "Americas", subregion: "North America", population: 331400000, independent: true, borders: ["CAN", "MEX"] },
    { name: { common: "Australia" }, cca3: "AUS", capital: ["Canberra"], flags: { svg: "https://flagcdn.com/au.svg", png: "https://flagcdn.com/w320/au.png" }, currencies: { AUD: { name: "Australian dollar", symbol: "$" } }, region: "Oceania", subregion: "Australia and New Zealand", population: 25690000, independent: true, borders: [] },
    { name: { common: "India" }, cca3: "IND", capital: ["New Delhi"], flags: { svg: "https://flagcdn.com/in.svg", png: "https://flagcdn.com/w320/in.png" }, currencies: { INR: { name: "Indian rupee", symbol: "₹" } }, region: "Asia", subregion: "Southern Asia", population: 1380000000, independent: true, borders: ["BGD", "BTN", "MMR", "CHN", "NPL", "PAK"] },
    { name: { common: "Egypt" }, cca3: "EGY", capital: ["Cairo"], flags: { svg: "https://flagcdn.com/eg.svg", png: "https://flagcdn.com/w320/eg.png" }, currencies: { EGP: { name: "Egyptian pound", symbol: "£" } }, region: "Africa", subregion: "Northern Africa", population: 102300000, independent: true, borders: ["ISR", "LBY", "SDN"] },
    { name: { common: "Germany" }, cca3: "DEU", capital: ["Berlin"], flags: { svg: "https://flagcdn.com/de.svg", png: "https://flagcdn.com/w320/de.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Western Europe", population: 83200000, independent: true, borders: ["AUT", "BEL", "CZE", "DNK", "FRA", "LUX", "NLD", "POL", "CHE"] },
    { name: { common: "Mexico" }, cca3: "MEX", capital: ["Mexico City"], flags: { svg: "https://flagcdn.com/mx.svg", png: "https://flagcdn.com/w320/mx.png" }, currencies: { MXN: { name: "Mexican peso", symbol: "$" } }, region: "Americas", subregion: "North America", population: 128900000, independent: true, borders: ["USA", "GTM", "BLZ"] },
    { name: { common: "Nigeria" }, cca3: "NGA", capital: ["Abuja"], flags: { svg: "https://flagcdn.com/ng.svg", png: "https://flagcdn.com/w320/ng.png" }, currencies: { NGN: { name: "Nigerian naira", symbol: "₦" } }, region: "Africa", subregion: "Western Africa", population: 206100000, independent: true, borders: ["BEN", "NER", "TCD", "CMR"] },
    { name: { common: "China" }, cca3: "CHN", capital: ["Beijing"], flags: { svg: "https://flagcdn.com/cn.svg", png: "https://flagcdn.com/w320/cn.png" }, currencies: { CNY: { name: "Chinese yuan", symbol: "¥" } }, region: "Asia", subregion: "Eastern Asia", population: 1402000000, independent: true, borders: ["AFG", "BTN", "MMR", "HKG", "IND", "KAZ", "PRK", "KGZ", "LAO", "MAC", "MNG", "NPL", "PAK", "RUS", "TJK", "VNM"] },
    { name: { common: "Russia" }, cca3: "RUS", capital: ["Moscow"], flags: { svg: "https://flagcdn.com/ru.svg", png: "https://flagcdn.com/w320/ru.png" }, currencies: { RUB: { name: "Russian ruble", symbol: "₽" } }, region: "Europe", subregion: "Eastern Europe", population: 144100000, independent: true, borders: ["AZE", "BLR", "CHN", "EST", "FIN", "GEO", "KAZ", "PRK", "LVA", "LTU", "MNG", "NOR", "POL", "UKR"] },
    { name: { common: "Canada" }, cca3: "CAN", capital: ["Ottawa"], flags: { svg: "https://flagcdn.com/ca.svg", png: "https://flagcdn.com/w320/ca.png" }, currencies: { CAD: { name: "Canadian dollar", symbol: "$" } }, region: "Americas", subregion: "North America", population: 38000000, independent: true, borders: ["USA"] },
    { name: { common: "South Korea" }, cca3: "KOR", capital: ["Seoul"], flags: { svg: "https://flagcdn.com/kr.svg", png: "https://flagcdn.com/w320/kr.png" }, currencies: { KRW: { name: "South Korean won", symbol: "₩" } }, region: "Asia", subregion: "Eastern Asia", population: 51780000, independent: true, borders: ["PRK"] },
    { name: { common: "Argentina" }, cca3: "ARG", capital: ["Buenos Aires"], flags: { svg: "https://flagcdn.com/ar.svg", png: "https://flagcdn.com/w320/ar.png" }, currencies: { ARS: { name: "Argentine peso", symbol: "$" } }, region: "Americas", subregion: "South America", population: 45370000, independent: true, borders: ["BOL", "BRA", "CHL", "PRY", "URY"] },
    { name: { common: "Turkey" }, cca3: "TUR", capital: ["Ankara"], flags: { svg: "https://flagcdn.com/tr.svg", png: "https://flagcdn.com/w320/tr.png" }, currencies: { TRY: { name: "Turkish lira", symbol: "₺" } }, region: "Asia", subregion: "Western Asia", population: 84340000, independent: true, borders: ["ARM", "AZE", "BGR", "GEO", "GRC", "IRN", "IRQ", "SYR"] },
    { name: { common: "Italy" }, cca3: "ITA", capital: ["Rome"], flags: { svg: "https://flagcdn.com/it.svg", png: "https://flagcdn.com/w320/it.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Southern Europe", population: 60360000, independent: true, borders: ["AUT", "FRA", "SMR", "SVN", "CHE", "VAT"] },
    { name: { common: "Spain" }, cca3: "ESP", capital: ["Madrid"], flags: { svg: "https://flagcdn.com/es.svg", png: "https://flagcdn.com/w320/es.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Southern Europe", population: 47350000, independent: true, borders: ["AND", "FRA", "GIB", "PRT", "MAR"] },
    { name: { common: "United Kingdom" }, cca3: "GBR", capital: ["London"], flags: { svg: "https://flagcdn.com/gb.svg", png: "https://flagcdn.com/w320/gb.png" }, currencies: { GBP: { name: "British pound", symbol: "£" } }, region: "Europe", subregion: "Northern Europe", population: 67890000, independent: true, borders: ["IRL"] },
    { name: { common: "South Africa" }, cca3: "ZAF", capital: ["Pretoria"], flags: { svg: "https://flagcdn.com/za.svg", png: "https://flagcdn.com/w320/za.png" }, currencies: { ZAR: { name: "South African rand", symbol: "R" } }, region: "Africa", subregion: "Southern Africa", population: 59310000, independent: true, borders: ["BWA", "LSO", "MOZ", "NAM", "SWZ", "ZWE"] },
    { name: { common: "Thailand" }, cca3: "THA", capital: ["Bangkok"], flags: { svg: "https://flagcdn.com/th.svg", png: "https://flagcdn.com/w320/th.png" }, currencies: { THB: { name: "Thai baht", symbol: "฿" } }, region: "Asia", subregion: "South-Eastern Asia", population: 69800000, independent: true, borders: ["MMR", "KHM", "LAO", "MYS"] },
    { name: { common: "Indonesia" }, cca3: "IDN", capital: ["Jakarta"], flags: { svg: "https://flagcdn.com/id.svg", png: "https://flagcdn.com/w320/id.png" }, currencies: { IDR: { name: "Indonesian rupiah", symbol: "Rp" } }, region: "Asia", subregion: "South-Eastern Asia", population: 273500000, independent: true, borders: ["TLS", "MYS", "PNG"] },
    { name: { common: "Saudi Arabia" }, cca3: "SAU", capital: ["Riyadh"], flags: { svg: "https://flagcdn.com/sa.svg", png: "https://flagcdn.com/w320/sa.png" }, currencies: { SAR: { name: "Saudi riyal", symbol: "ر.س" } }, region: "Asia", subregion: "Western Asia", population: 34810000, independent: true, borders: ["IRQ", "JOR", "KWT", "OMN", "QAT", "ARE", "YEM"] },
    { name: { common: "Kenya" }, cca3: "KEN", capital: ["Nairobi"], flags: { svg: "https://flagcdn.com/ke.svg", png: "https://flagcdn.com/w320/ke.png" }, currencies: { KES: { name: "Kenyan shilling", symbol: "Sh" } }, region: "Africa", subregion: "Eastern Africa", population: 53770000, independent: true, borders: ["ETH", "SOM", "SSD", "TZA", "UGA"] },
    { name: { common: "Sweden" }, cca3: "SWE", capital: ["Stockholm"], flags: { svg: "https://flagcdn.com/se.svg", png: "https://flagcdn.com/w320/se.png" }, currencies: { SEK: { name: "Swedish krona", symbol: "kr" } }, region: "Europe", subregion: "Northern Europe", population: 10350000, independent: true, borders: ["FIN", "NOR"] },
    { name: { common: "Norway" }, cca3: "NOR", capital: ["Oslo"], flags: { svg: "https://flagcdn.com/no.svg", png: "https://flagcdn.com/w320/no.png" }, currencies: { NOK: { name: "Norwegian krone", symbol: "kr" } }, region: "Europe", subregion: "Northern Europe", population: 5380000, independent: true, borders: ["FIN", "SWE", "RUS"] },
    { name: { common: "Poland" }, cca3: "POL", capital: ["Warsaw"], flags: { svg: "https://flagcdn.com/pl.svg", png: "https://flagcdn.com/w320/pl.png" }, currencies: { PLN: { name: "Polish złoty", symbol: "zł" } }, region: "Europe", subregion: "Central Europe", population: 37950000, independent: true, borders: ["BLR", "CZE", "DEU", "LTU", "RUS", "SVK", "UKR"] },
    { name: { common: "Greece" }, cca3: "GRC", capital: ["Athens"], flags: { svg: "https://flagcdn.com/gr.svg", png: "https://flagcdn.com/w320/gr.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Southern Europe", population: 10720000, independent: true, borders: ["ALB", "BGR", "TUR", "MKD"] },
    { name: { common: "Colombia" }, cca3: "COL", capital: ["Bogotá"], flags: { svg: "https://flagcdn.com/co.svg", png: "https://flagcdn.com/w320/co.png" }, currencies: { COP: { name: "Colombian peso", symbol: "$" } }, region: "Americas", subregion: "South America", population: 50880000, independent: true, borders: ["BRA", "ECU", "PAN", "PER", "VEN"] },
    { name: { common: "Chile" }, cca3: "CHL", capital: ["Santiago"], flags: { svg: "https://flagcdn.com/cl.svg", png: "https://flagcdn.com/w320/cl.png" }, currencies: { CLP: { name: "Chilean peso", symbol: "$" } }, region: "Americas", subregion: "South America", population: 19110000, independent: true, borders: ["ARG", "BOL", "PER"] },
    { name: { common: "Peru" }, cca3: "PER", capital: ["Lima"], flags: { svg: "https://flagcdn.com/pe.svg", png: "https://flagcdn.com/w320/pe.png" }, currencies: { PEN: { name: "Peruvian sol", symbol: "S/ " } }, region: "Americas", subregion: "South America", population: 32970000, independent: true, borders: ["BOL", "BRA", "CHL", "COL", "ECU"] },
    { name: { common: "Pakistan" }, cca3: "PAK", capital: ["Islamabad"], flags: { svg: "https://flagcdn.com/pk.svg", png: "https://flagcdn.com/w320/pk.png" }, currencies: { PKR: { name: "Pakistani rupee", symbol: "₨" } }, region: "Asia", subregion: "Southern Asia", population: 220890000, independent: true, borders: ["AFG", "CHN", "IND", "IRN"] },
    { name: { common: "Bangladesh" }, cca3: "BGD", capital: ["Dhaka"], flags: { svg: "https://flagcdn.com/bd.svg", png: "https://flagcdn.com/w320/bd.png" }, currencies: { BDT: { name: "Bangladeshi taka", symbol: "৳" } }, region: "Asia", subregion: "Southern Asia", population: 164690000, independent: true, borders: ["MMR", "IND"] },
    { name: { common: "Vietnam" }, cca3: "VNM", capital: ["Hanoi"], flags: { svg: "https://flagcdn.com/vn.svg", png: "https://flagcdn.com/w320/vn.png" }, currencies: { VND: { name: "Vietnamese đồng", symbol: "₫" } }, region: "Asia", subregion: "South-Eastern Asia", population: 97340000, independent: true, borders: ["KHM", "CHN", "LAO"] },
    { name: { common: "Philippines" }, cca3: "PHL", capital: ["Manila"], flags: { svg: "https://flagcdn.com/ph.svg", png: "https://flagcdn.com/w320/ph.png" }, currencies: { PHP: { name: "Philippine peso", symbol: "₱" } }, region: "Asia", subregion: "South-Eastern Asia", population: 109580000, independent: true, borders: [] },
    { name: { common: "Morocco" }, cca3: "MAR", capital: ["Rabat"], flags: { svg: "https://flagcdn.com/ma.svg", png: "https://flagcdn.com/w320/ma.png" }, currencies: { MAD: { name: "Moroccan dirham", symbol: "د.م." } }, region: "Africa", subregion: "Northern Africa", population: 36910000, independent: true, borders: ["DZA", "ESP"] },
    { name: { common: "New Zealand" }, cca3: "NZL", capital: ["Wellington"], flags: { svg: "https://flagcdn.com/nz.svg", png: "https://flagcdn.com/w320/nz.png" }, currencies: { NZD: { name: "New Zealand dollar", symbol: "$" } }, region: "Oceania", subregion: "Australia and New Zealand", population: 5084000, independent: true, borders: [] },
    { name: { common: "Ireland" }, cca3: "IRL", capital: ["Dublin"], flags: { svg: "https://flagcdn.com/ie.svg", png: "https://flagcdn.com/w320/ie.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Northern Europe", population: 4990000, independent: true, borders: ["GBR"] },
    { name: { common: "Switzerland" }, cca3: "CHE", capital: ["Bern"], flags: { svg: "https://flagcdn.com/ch.svg", png: "https://flagcdn.com/w320/ch.png" }, currencies: { CHF: { name: "Swiss franc", symbol: "CHF" } }, region: "Europe", subregion: "Western Europe", population: 8650000, independent: true, borders: ["AUT", "FRA", "ITA", "LIE", "DEU"] },
    { name: { common: "Portugal" }, cca3: "PRT", capital: ["Lisbon"], flags: { svg: "https://flagcdn.com/pt.svg", png: "https://flagcdn.com/w320/pt.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Southern Europe", population: 10310000, independent: true, borders: ["ESP"] },
    { name: { common: "Cuba" }, cca3: "CUB", capital: ["Havana"], flags: { svg: "https://flagcdn.com/cu.svg", png: "https://flagcdn.com/w320/cu.png" }, currencies: { CUP: { name: "Cuban peso", symbol: "$" } }, region: "Americas", subregion: "Caribbean", population: 11330000, independent: true, borders: [] },
    { name: { common: "Ethiopia" }, cca3: "ETH", capital: ["Addis Ababa"], flags: { svg: "https://flagcdn.com/et.svg", png: "https://flagcdn.com/w320/et.png" }, currencies: { ETB: { name: "Ethiopian birr", symbol: "Br" } }, region: "Africa", subregion: "Eastern Africa", population: 114960000, independent: true, borders: ["DJI", "ERI", "KEN", "SOM", "SSD", "SDN"] },
    { name: { common: "Malaysia" }, cca3: "MYS", capital: ["Kuala Lumpur"], flags: { svg: "https://flagcdn.com/my.svg", png: "https://flagcdn.com/w320/my.png" }, currencies: { MYR: { name: "Malaysian ringgit", symbol: "RM" } }, region: "Asia", subregion: "South-Eastern Asia", population: 32370000, independent: true, borders: ["BRN", "IDN", "THA"] },
    { name: { common: "Finland" }, cca3: "FIN", capital: ["Helsinki"], flags: { svg: "https://flagcdn.com/fi.svg", png: "https://flagcdn.com/w320/fi.png" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, region: "Europe", subregion: "Northern Europe", population: 5530000, independent: true, borders: ["NOR", "SWE", "RUS"] },
    { name: { common: "Ukraine" }, cca3: "UKR", capital: ["Kyiv"], flags: { svg: "https://flagcdn.com/ua.svg", png: "https://flagcdn.com/w320/ua.png" }, currencies: { UAH: { name: "Ukrainian hryvnia", symbol: "₴" } }, region: "Europe", subregion: "Eastern Europe", population: 44130000, independent: true, borders: ["BLR", "HUN", "MDA", "POL", "ROU", "RUS", "SVK"] },
    { name: { common: "Israel" }, cca3: "ISR", capital: ["Jerusalem"], flags: { svg: "https://flagcdn.com/il.svg", png: "https://flagcdn.com/w320/il.png" }, currencies: { ILS: { name: "Israeli new shekel", symbol: "₪" } }, region: "Asia", subregion: "Western Asia", population: 9220000, independent: true, borders: ["EGY", "JOR", "LBN", "SYR"] },
    { name: { common: "Singapore" }, cca3: "SGP", capital: ["Singapore"], flags: { svg: "https://flagcdn.com/sg.svg", png: "https://flagcdn.com/w320/sg.png" }, currencies: { SGD: { name: "Singapore dollar", symbol: "$" } }, region: "Asia", subregion: "South-Eastern Asia", population: 5860000, independent: true, borders: [] },
    { name: { common: "Jamaica" }, cca3: "JAM", capital: ["Kingston"], flags: { svg: "https://flagcdn.com/jm.svg", png: "https://flagcdn.com/w320/jm.png" }, currencies: { JMD: { name: "Jamaican dollar", symbol: "$" } }, region: "Americas", subregion: "Caribbean", population: 2960000, independent: true, borders: [] },
    { name: { common: "Nepal" }, cca3: "NPL", capital: ["Kathmandu"], flags: { svg: "https://flagcdn.com/np.svg", png: "https://flagcdn.com/w320/np.png" }, currencies: { NPR: { name: "Nepalese rupee", symbol: "₨" } }, region: "Asia", subregion: "Southern Asia", population: 29140000, independent: true, borders: ["CHN", "IND"] },
    { name: { common: "Iceland" }, cca3: "ISL", capital: ["Reykjavik"], flags: { svg: "https://flagcdn.com/is.svg", png: "https://flagcdn.com/w320/is.png" }, currencies: { ISK: { name: "Icelandic króna", symbol: "kr" } }, region: "Europe", subregion: "Northern Europe", population: 366000, independent: true, borders: [] },
];


// ===================== PERSISTENCE =====================
// ===================== PERSISTENCE =====================
function getDefaultSave() {
    return { xp: 0, level: 1, totalCorrect: 0, totalWrong: 0, bestStreak: 0, answered: { flag: [], capital: [], currency: [], population: [], border: [], emoji: [], sentinel: [] } };
}

function loadSave(username) {
    const fallback = getDefaultSave();
    if (!username) return fallback;
    try {
        const key = CONFIG.STORAGE_KEY + '_' + username;
        const raw = localStorage.getItem(key);
        if (raw && raw !== 'null' && raw !== 'undefined') {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                // Merge with fallback to ensure all properties exist
                return { ...fallback, ...parsed, answered: { ...fallback.answered, ...(parsed.answered || {}) } };
            }
        }
    } catch (e) { console.warn('Save corrupted, resetting.'); }
    return fallback;
}

function saveSave(data) {
    if (!currentUser) return;
    try { localStorage.setItem(CONFIG.STORAGE_KEY + '_' + currentUser, JSON.stringify(data)); } catch (e) { }
}

// ===================== STATE =====================
let allCountries = [];
let currentUser = null;
let save = getDefaultSave(); // Default empty state until login
let currentGame = null; // active game session

// ===================== DOM REFERENCES =====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===================== COUNTRY DATA SERVICE =====================
async function fetchCountries() {
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
        console.warn('API fetch failed, using built-in data:', err.message);
        return FALLBACK_COUNTRIES;
    }
}

// ===================== AI SERVICE =====================
// Emoji Nexus Generator
async function getEmojiHints(countryName) {
    const seed = Math.floor(Math.random() * 99999);
    const prompt = `Generate EXACTLY 5 distinct emojis for "${countryName}".
Focus on: Culture, Nature, Food, Landmarks.
Constraint: Output ONLY the 5 emojis. No text.
Random Seed: ${seed}`;

    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 20000);
        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + CONFIG.AI_KEY,
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

        // Filter garbage
        emojis = emojis.filter(e => e.length >= 2 || e.codePointAt(0) > 1000);

        // PAD if too few
        const fallback = ['🌍', '📍', '🗺️', '🏳️', '🌐', '🏙️', '🏞️'];
        while (emojis.length < 5) {
            emojis.push(fallback[Math.floor(Math.random() * fallback.length)]);
        }

        // SLICE if too many
        return emojis.slice(0, 5).join('');
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
    return base + '🗺️' + pop + cur + '🚩';
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
        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + CONFIG.AI_KEY,
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

    try {
        const res = await fetch(CONFIG.API_AI, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + CONFIG.AI_KEY,
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
    }

    miss() {
        this.streak = 0;
        this.lives--;
        save.totalWrong++;
        saveSave(save);
    }

    markAnswered(cca3) {
        if (this.mode !== 'oracle') {
            if (!save.answered[this.mode]) save.answered[this.mode] = [];
            if (!save.answered[this.mode].includes(cca3)) {
                save.answered[this.mode].push(cca3);
            }
        }
        saveSave(save);
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
            subject.innerHTML = cur.name + ' <span style="color:var(--amber)">(' + (cur.symbol || '?') + ')</span>';
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
                location.reload();
            }
        });
    });

    $('#btn-reset').addEventListener('click', () => {
        NexusModal.confirm('WIPE DATA?', 'This will permanently ERASE all agent progress. This action cannot be undone.', (ok) => {
            if (ok) {
                const key = CONFIG.STORAGE_KEY + '_' + currentUser;
                localStorage.removeItem(key);
                save = getDefaultSave();
                location.reload();
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

    // Settings
    $('#btn-open-settings').addEventListener('click', () => {
        showView('settings');
        $('#settings-username').value = currentUser;
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
                $('#sidebar').classList.remove('open');
                $('#sidebar-overlay').classList.remove('visible');
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

// Decode JWT for Google Profile
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

// ===================== AUTH LOGIC =====================
function handleAuth() {
    return new Promise(resolve => {
        const lastUser = localStorage.getItem('geo_last_user');

        const finalizeLogin = (user) => {
            loginUser(user);
            localStorage.setItem('geo_last_user', user);
            $('#auth-screen').classList.add('hidden');
            resolve();
        };

        // Initialize Real Google SDK
        if (window.google) {
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                callback: (response) => {
                    const payload = decodeJWT(response.credential);
                    if (payload && payload.name) {
                        finalizeLogin(payload.name.replace(/\s/g, '_'));
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true
            });
        }

        if (lastUser) {
            loginUser(lastUser);
            resolve();
        } else {
            if ($('#splash-screen')) $('#splash-screen').classList.add('hidden');
            $('#auth-screen').classList.remove('hidden');

            const renderGoogleBtn = () => {
                if (window.google) {
                    google.accounts.id.renderButton(
                        document.getElementById("btn-google"),
                        {
                            theme: "filled_blue",
                            size: "large",
                            text: "continue_with",
                            shape: "pill",
                            width: "280"
                        }
                    );
                } else {
                    setTimeout(renderGoogleBtn, 100);
                }
            };
            renderGoogleBtn();
        }
    });
}

function loginUser(username) {
    currentUser = username;
    save = loadSave(username);

    // Update UI
    const nameEl = $('#user-name');
    if (nameEl) nameEl.textContent = username;

    // Initialize stats
    updateSidebarStats();
}

// ===================== SPLASH & BOOT =====================
async function boot() {
    const splashFill = $('#splash-fill');
    const splashStatus = $('#splash-status');

    try {
        // Step 0: Auth
        if (splashStatus) splashStatus.textContent = 'Establishing Secure Link...';
        await handleAuth();
        if ($('#splash-screen')) $('#splash-screen').classList.remove('hidden');


        // Step 1: UI ready
        splashFill.style.width = '20%';
        splashStatus.textContent = 'Loading interface...';
        await sleep(300);

        // Step 2: Fetch data
        splashFill.style.width = '50%';
        splashStatus.textContent = 'Downloading country database...';
        allCountries = await fetchCountries();

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
