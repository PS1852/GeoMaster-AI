const BASE_URL = 'https://restcountries.com/v3.1/all';

class CountryService {
    constructor() {
        this.cache = null;
        this.status = 'idle'; // idle | fetching | ready | error
    }

    async init() {
        if (this.cache) return this.cache;

        try {
            this.status = 'fetching';
            console.log('Fetching Country Data...');

            // Try fetching with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(BASE_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Failed to fetch country data');

            const rawData = await response.json();

            // Filter out non-independent entities or tiny islands if needed
            // But let's keep most for difficulty. Just filter those without capitals.
            this.cache = rawData.filter(c => c.independent && c.capital && c.capital.length > 0 && c.currencies);

            this.status = 'ready';
            console.log(`Loaded ${this.cache.length} countries.`);
            return this.cache;
        } catch (error) {
            console.warn('Country Service Initialization failed, using fallback data:', error);

            // Fallback Mock Data so app works offline
            this.cache = [
                { name: { common: "France" }, cca3: "FRA", capital: ["Paris"], flags: { svg: "https://flagcdn.com/fr.svg" }, currencies: { EUR: { name: "Euro", symbol: "€" } }, independent: true, region: "Europe", subregion: "Western Europe", population: 67391582 },
                { name: { common: "Japan" }, cca3: "JPN", capital: ["Tokyo"], flags: { svg: "https://flagcdn.com/jp.svg" }, currencies: { JPY: { name: "Japanese yen", symbol: "¥" } }, independent: true, region: "Asia", subregion: "Eastern Asia", population: 125836021 },
                { name: { common: "Brazil" }, cca3: "BRA", capital: ["Brasília"], flags: { svg: "https://flagcdn.com/br.svg" }, currencies: { BRL: { name: "Brazilian real", symbol: "R$" } }, independent: true, region: "Americas", subregion: "South America", population: 213993441 },
                { name: { common: "United States" }, cca3: "USA", capital: ["Washington, D.C."], flags: { svg: "https://flagcdn.com/us.svg" }, currencies: { USD: { name: "United States dollar", symbol: "$" } }, independent: true, region: "Americas", subregion: "North America", population: 331449281 },
                { name: { common: "Australia" }, cca3: "AUS", capital: ["Canberra"], flags: { svg: "https://flagcdn.com/au.svg" }, currencies: { AUD: { name: "Australian dollar", symbol: "$" } }, independent: true, region: "Oceania", subregion: "Australia and New Zealand", population: 25687041 },
                { name: { common: "India" }, cca3: "IND", capital: ["New Delhi"], flags: { svg: "https://flagcdn.com/in.svg" }, currencies: { INR: { name: "Indian rupee", symbol: "₹" } }, independent: true, region: "Asia", subregion: "Southern Asia", population: 1380004385 },
                { name: { common: "Egypt" }, cca3: "EGY", capital: ["Cairo"], flags: { svg: "https://flagcdn.com/eg.svg" }, currencies: { EGP: { name: "Egyptian pound", symbol: "£" } }, independent: true, region: "Africa", subregion: "Northern Africa", population: 102334403 }
            ];
            this.status = 'ready (fallback)';
            return this.cache;
        }
    }

    getRandomCountries(n = 4) {
        if (!this.cache) throw new Error('Service not initialized');
        const shuffled = [...this.cache].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    getCountryByName(name) {
        return this.cache.find(c => c.name.common === name);
    }

    // returns array of [correct, ...distractors]
    generateQuestionSet(mode) {
        const batch = this.getRandomCountries(4);
        const correct = batch[0];
        const distractors = batch.slice(1);

        // Shuffle the options for display
        const options = [...batch].sort(() => 0.5 - Math.random());

        return {
            target: correct,
            options: options
        };
    }
}

export const countryService = new CountryService();
