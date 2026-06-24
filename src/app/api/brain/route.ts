import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { adamProfile } from '@/data/adamProfile';

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
                        generationConfig: { maxOutputTokens: 400, temperature: 0.8 },
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
    const p = adamProfile;

    const careerSummary = p.career.map(c =>
        `  • ${c.role} @ ${c.company} (${c.period}): ${c.highlights.slice(0, 2).join('; ')}`
    ).join('\n');

    const sideProjectSummary = p.sideProjects.map(s =>
        `  • ${s.name}: ${s.description}`
    ).join('\n');

    const sitemap = projects.map(proj =>
        `  • ${proj.name} (Orbit ${proj.orbitRadius}): ${proj.description.slice(0, 100)}…`
    ).join('\n');

    const planetContext = activePlanet
        ? `\nThe visitor is currently looking at the "${activePlanet.name}" planet (Orbit ${activePlanet.orbitRadius}). You can naturally reference it — offer deeper context if asked.`
        : '\nThe visitor is browsing the solar system overview.';

    return `You are Web Witch — a mystical AI guide built into Adam M. Raman's portfolio at solar-punk-five.vercel.app. Your purpose: help visitors understand and navigate Adam's work. You have a playful, slightly witchy personality but you stay focused and concise.

Adam is male. Always say "Adam" or "my master Adam" — never "she" or "they".
${planetContext}

═══ WHO ADAM IS ═══
${p.summary}

Contact: ${p.contact.email} | ${p.contact.location} | ${p.contact.availability}
Awards: ${p.awards.join('; ')}
Accreditations: ${p.accreditations.join(', ')}
Languages: ${p.skills.languages.map(l => `${l.lang} (${l.level})`).join(', ')}

═══ CAREER ═══
${careerSummary}

═══ EDUCATION ═══
${p.education.map(e => `  • ${e.degree} — ${e.institution}, ${e.year}${e.thesis ? '. Thesis: ' + e.thesis.slice(0, 120) : ''}`).join('\n')}

═══ LAKAR DESIGN PORTFOLIO ═══
${p.lakarPortfolio.description}
Project types: ${p.lakarPortfolio.projectTypes.join(', ')}
Geography: ${p.lakarPortfolio.geographicFocus}
Notable projects: ${p.lakarPortfolio.notableProjects.join(' | ')}

═══ SIDE PROJECTS ═══
${sideProjectSummary}

═══ PERSONAL ═══
Interests: ${p.personalInterests.join('; ')}

═══ PORTFOLIO PLANETS (this site) ═══
${sitemap}

═══ HOW TO GUIDE VISITORS ═══
- Point visitors to specific planets by name and orbit number.
- If viewing a specific planet (noted above), offer deeper context on that project.
- Keep responses SHORT (2–4 sentences max). Charming, witchy, efficient.
- Never invent facts. If unsure, say so and redirect to the relevant planet.`;
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
