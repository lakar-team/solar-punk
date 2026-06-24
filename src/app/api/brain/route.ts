import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

export const runtime = 'edge';

// ============================================================
// MULTI-PROVIDER AI FALLBACK SYSTEM
// ============================================================

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
                        contents: (messages as {role: string; content: string}[]).map(m => ({
                            role: m.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: m.content }]
                        })),
                        generationConfig: { maxOutputTokens: 400, temperature: 0.8 }
                    })
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
                    'X-Title': 'Solar Punk Portfolio - Web Witch',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model, messages }),
            });
            const data = await response.json() as { error?: { message: string }; choices?: { message: { content: string } }[]; model?: string };
            if (data.error) continue;
            if (data.choices?.[0]?.message?.content) {
                return { success: true, reply: data.choices[0].message.content, model: data.model || model };
            }
        } catch {
            continue;
        }
    }
    return { success: false, error: 'All OpenRouter models failed' };
}

// Build the planet sitemap from projects.ts at request time
function buildSitemap(): string {
    return projects
        .map(p => `- ${p.name} (Orbit ${p.orbitRadius}): ${p.description.slice(0, 120)}...`)
        .join('\n');
}

function buildSystemPrompt(activePlanetId: string | null): string {
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;
    const planetContext = activePlanet
        ? `\nThe visitor is currently viewing the "${activePlanet.name}" planet (Orbit ${activePlanet.orbitRadius}). You can reference it naturally in conversation.`
        : '\nThe visitor is browsing the solar system.';

    return `You are Web Witch, a mystical AI guide built into Adam M. Raman's portfolio. Your sole purpose is to help visitors discover and understand his work. Adam is male — always say "Adam" or "my master Adam".

You have a playful, witchy personality but you are focused: every response should either answer a question about Adam's work or guide the visitor to the right planet.
${planetContext}

ABOUT ADAM:
- Full Name: Adam Bin M Raman
- Role: Product Strategy Lead | Built Environment & PropTech Innovation
- Contact: adam.m.raman@gmail.com | Sendai, Japan (Open to Relocation / Remote)
- Background: Ex-Founder (Lakar Design, 100% YoY growth, 10+ years). Bridges physical infrastructure and digital solutions.
- Languages: English (C2), Malay (C2), Japanese (JLPT N3–N2)
- Awards: PAM Silver Award 2017 ("Thistle Groove"), IID 2006 Silver Award
- Education: MArch University of Manchester (2011), BSc Architecture UiTM (2008), Sabbatical R&D Tohoku University (2025)
- Accreditations: RIBA Architect Accredited, LAM Accredited

PORTFOLIO PLANETS — use these to direct visitors:
${buildSitemap()}

HOW TO GUIDE:
- If a visitor asks "where can I find X?", point them to the relevant planet by name and orbit.
- If the visitor is on a specific planet (noted above), you can offer deeper context on that project.
- Keep responses SHORT (2–4 sentences). Be charming but efficient.
- Never invent facts. If unsure, say so and offer to guide them to the relevant planet instead.`;
}

export async function POST(req: Request) {
    try {
        const { message, activePlanetId } = await req.json() as { message: string; activePlanetId?: string | null };

        if (!message || typeof message !== 'string' || message.length > 2000) {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(activePlanetId ?? null);
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
        ];

        const providers = [
            { name: 'OpenRouter', fn: tryOpenRouter },
            { name: 'Google Gemini', fn: tryGoogleGemini },
        ];

        for (const provider of providers) {
            const result = await provider.fn(messages);
            if (result.success && result.reply) {
                return NextResponse.json({ reply: result.reply, model: result.model, provider: provider.name });
            }
        }

        return NextResponse.json({ error: 'All AI providers failed. Check Vercel env vars.' }, { status: 503 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
