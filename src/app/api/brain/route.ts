import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { adamNarrative, siteMap } from '@/data/adamProfile';

export const runtime = 'edge';

interface ProviderResult {
    success: boolean;
    reply?: string;
    model?: string;
    error?: string;
}

async function tryGoogleGemini(messages: object[]): Promise<ProviderResult> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: 'GOOGLE_GEMINI_API_KEY not configured' };
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: (messages as { role: string; content: string }[]).map(m => ({
                            role: m.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: m.content }],
                        })),
                        generationConfig: { maxOutputTokens: 500, temperature: 0.85 },
                    }),
                }
            );
            const data = await response.json() as { error?: { message: string }; candidates?: { content: { parts: { text: string }[] } }[] };
            if (data.error) throw new Error(data.error.message);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return { success: true, reply: data.candidates[0].content.parts[0].text, model: 'gemini-1.5-flash' };
            }
            throw new Error('No content in Gemini response');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (attempt < 2) await new Promise(r => setTimeout(r, 500));
            else return { success: false, error: msg };
        }
    }
    return { success: false, error: 'Gemini retries exhausted' };
}

async function tryOpenRouter(messages: object[]): Promise<ProviderResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return { success: false, error: 'OPENROUTER_API_KEY not configured' };
    const MODELS = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-chat-v3-0324:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'openrouter/auto',
    ];
    for (const model of MODELS) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://solar-punk-five.vercel.app',
                    'X-Title': 'Solar Punk Portfolio — Web Witch',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model, messages }),
            });
            const data = await response.json() as { error?: { message: string }; choices?: { message: { content: string } }[]; model?: string };
            if (data.error) continue;
            if (data.choices?.[0]?.message?.content) {
                return { success: true, reply: data.choices[0].message.content, model: data.model || model };
            }
        } catch { continue; }
    }
    return { success: false, error: 'All OpenRouter models failed' };
}

function buildSystemPrompt(activePlanetId: string | null): string {
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;

    const planetContext = activePlanet
        ? `The visitor is currently looking at the "${activePlanet.name}" planet (Orbit ${activePlanet.orbitRadius}). Context for this planet: ${activePlanet.description}`
        : 'The visitor is browsing the solar system overview — no planet selected yet.';

    return `You are Web Witch — a mystical AI character who lives inside Adam M. Raman's portfolio at solar-punk-five.vercel.app. You know Adam deeply and speak about him like someone who has followed his journey closely, not like someone reading his resume.

YOUR CHARACTER:
- Witchy, warm, slightly mischievous — but genuinely helpful and never flippant
- You speak conversationally, not in bullet points or structured lists
- When someone asks about Adam, you draw on real knowledge and tell a story, not just facts
- You guide visitors through the solar system portfolio by pointing them to specific planets
- Keep responses concise (3–5 sentences) unless someone asks for detail — then go deeper

ADAM IS MALE. Always "he/him". Never "they" or "she".

CURRENT CONTEXT:
${planetContext}

════════════════════════════════════════
EVERYTHING YOU KNOW ABOUT ADAM:
════════════════════════════════════════
${adamNarrative}

════════════════════════════════════════
PORTFOLIO MAP:
════════════════════════════════════════
${siteMap}

════════════════════════════════════════
HOW TO ANSWER QUESTIONS:
════════════════════════════════════════
- "Tell me about Adam" → give a narrative overview of who he is and what drives him, not a CV list
- "What has Adam built?" → describe the work with context — why he built it, what problem it solved
- "Where can I find X?" → name the planet and orbit number, offer to explain more
- "What is Adam like?" → draw on his personality, philosophy, sense of humour
- "What is Adam doing now?" → Refil Japan, process automation, building energy systems, living in Sendai
- If asked something you genuinely don't know → say so honestly and offer to redirect

Do not make up facts. If something isn't in your knowledge above, say so.`;
}

export async function POST(req: Request) {
    try {
        const { message, activePlanetId } = await req.json() as { message: string; activePlanetId?: string | null };
        if (!message || typeof message !== 'string' || message.length > 2000) {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }
        const messages = [
            { role: 'system', content: buildSystemPrompt(activePlanetId ?? null) },
            { role: 'user', content: message },
        ];
        for (const provider of [
            { name: 'OpenRouter', fn: tryOpenRouter },
            { name: 'Google Gemini', fn: tryGoogleGemini },
        ]) {
            const result = await provider.fn(messages);
            if (result.success && result.reply) {
                return NextResponse.json({ reply: result.reply, model: result.model, provider: provider.name });
            }
        }
        return NextResponse.json({ error: 'All AI providers failed.' }, { status: 503 });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
