const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free'; // Fallback to 'openai/gpt-3.5-turbo' if needed

class AIService {
    constructor() {
        this.currentController = null;
    }

    async getHintsForCountry(countryName) {
        // Abort previous request if any
        if (this.currentController) {
            this.currentController.abort();
        }
        this.currentController = new AbortController();

        const systemPrompt = `Provide 3 distinct, high-level factual hints for ${countryName}. 
        Hint 1: Geography/Climate. 
        Hint 2: Culture/Food. 
        Hint 3: A unique historical fact. 
        Never mention the country name or its capital within the hints themselves. 
        Format as clear distinct sentences labeled 1., 2., 3.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://geo-master-ai.vercel.app', // Optional for OpenRouter rankings
                    'X-Title': 'GeoMaster AI'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'user', content: systemPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                }),
                signal: this.currentController.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('AI API Error:', errorData);
                throw new Error(`AI Service Failed: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            return this.parseHints(content);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('AI Request Aborted');
                return null;
            }
            console.error('AI Service Error:', error);
            // Fallback hints if AI fails
            return [
                "Technical interference detected in the neural link...",
                "Location data corrupted...",
                "Try again later."
            ];
        }
    }

    parseHints(rawText) {
        // Basic parsing to split 1., 2., 3.
        const hints = rawText.split(/\d\.\s+/).filter(h => h.trim().length > 5);
        return hints.slice(0, 3);
    }
}

export const aiService = new AIService();
