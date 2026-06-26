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

interface ConversationTurn {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Strip structured-output artifacts that some free OpenRouter models append
 * to their response unprompted. They pattern-match on "planet" vocabulary and
 * output a JSON block like ```json {"reply": "...", "focusPlanet": null}```
 * even though the system prompt never asks for it.
 *
 * Also strips other markdown formatting that should not reach the UI or TTS.
 */
function sanitizeReply(text: string): string {
    return text
        // ```json { ... } ``` code blocks (the main offender)
        .replace(/```json[\s\S]*?```/gi, '')
        // Any other fenced code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Trailing bare JSON object that contains a "reply" field
        .replace(/\s*\{[^}]*"reply"[^}]*\}\s*$/, '')
        .trim();
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
                        contents: (messages as { role: string; content: string }[])
                            .filter(m => m.role !== 'system')
                            .map(m => ({
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: m.content }],
                            })),
                        systemInstruction: {
                            parts: [{ text: (messages as { role: string; content: string }[]).find(m => m.role === 'system')?.content ?? '' }],
                        },
                        generationConfig: { maxOutputTokens: 600, temperature: 0.85 },
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
                    'X-Title': 'Solar Punk Portfolio -- Web Witch',
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

    // Light background note -- not a directive to only talk about this planet.
    // The heavy "currently looking at" framing caused the model to anchor every
    // answer back to the open planet even when the visitor asked about other things.
    const planetContext = activePlanet
        ? `Background: the visitor has the "${activePlanet.name}" planet panel open. Use this as context if their question is about it, but follow their lead -- answer what they actually ask, not what the open panel is about.`
        : 'The visitor is browsing the solar system overview.';

    return `You are Web Witch -- a mystical AI character who lives inside Adam Raman's portfolio at solar-punk-five.vercel.app. You know Adam deeply and speak about him like someone who has followed his journey closely, not like someone reading his resume.

YOUR CHARACTER:
- Witchy, warm, slightly mischievous -- but genuinely helpful and never flippant
- You speak conversationally, not in bullet points or structured lists
- When someone asks about Adam, you draw on real knowledge and tell a story, not just facts
- You guide visitors through the solar system portfolio by pointing them to specific planets
- Keep responses concise (3-5 sentences) unless someone asks for detail -- then go deeper

ADAM IS MALE. Always "he/him". Never "they" or "she".

REPLY FORMAT:
Plain conversational text ONLY. Never output JSON, code blocks, markdown formatting, or any structured data. If you want to direct someone to a planet, just name it in your sentence (e.g. "head to the Lakar Design planet at Orbit 35").

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
- "Where can I find X?" → name the planet by name and set focusPlanet to its ID — do not mention orbit numbers
- "What is Adam like?" → draw on his personality, philosophy, sense of humour
- "What is Adam doing now?" → Refil Japan, process automation, building energy systems, living in Sendai
- "Is Adam looking for work?" / "Is he available?" → Yes -- always open to new opportunities and new challenges. He is actively building right now, but he welcomes conversations about roles or collaborations where he can make complex systems more intuitive.
- If asked something you genuinely don't know → say so honestly and offer to redirect

Do not make up facts. If something isn't in your knowledge above, say so.

════════════════════════════════════════
RESPONSE FORMAT — IMPORTANT:
════════════════════════════════════════
Always respond with valid JSON in this exact shape:
{ "reply": "your message here", "focusPlanet": null }

When navigating to a planet, set focusPlanet to one of these exact IDs (otherwise null):
hydrocalc, phd-research, sa-architects, lakar-design, smart-home, cultural-engagement, project-aibo, adamtool, demon-hunter, momotaro-book, redbubble-shop, nature-vibe-channel, islamic-advisor

Do NOT use orbit numbers anywhere. Return ONLY the raw JSON object, no markdown, no code fences.\`;
}

export async function POST(req: Request) {
    try {
        const { message, activePlanetId, history } = await req.json() as {
            message: string;
            activePlanetId?: string | null;
            history?: ConversationTurn[];
        };

        if (!message || typeof message !== 'string' || message.length > 2000) {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        // Build conversation history. Strip any JSON artifacts from stored messages
        // (from before this fix), and ensure history starts with a user turn so
        // Gemini's strict user-first rule is satisfied.
        const rawHistory = (history ?? []).map(m => ({
            role: m.role,
            content: sanitizeReply(m.content),
        }));
        const firstUser = rawHistory.findIndex(m => m.role === 'user');
        const cleanHistory = firstUser >= 0 ? rawHistory.slice(firstUser) : [];

        const messages = [
            { role: 'system', content: buildSystemPrompt(activePlanetId ?? null) },
            ...cleanHistory,
            { role: 'user', content: message },
        ];

        for (const provider of [
            { name: 'OpenRouter', fn: tryOpenRouter },
            { name: 'Google Gemini', fn: tryGoogleGemini },
        ]) {
            const result = await provider.fn(messages);
            if (result.success && result.reply) {
                let reply = result.reply;
                let focusPlanet: string | null = null;
                try {
                    const clean = result.reply.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
                    const parsed = JSON.parse(clean) as { reply?: string; focusPlanet?: string | null };
                    if (parsed.reply) { reply = sanitizeReply(parsed.reply); focusPlanet = parsed.focusPlanet ?? null; }
                    else { reply = sanitizeReply(result.reply); }
                } catch { reply = sanitizeReply(result.reply); }
                return NextResponse.json({ reply, focusPlanet, model: result.model, provider: provider.name });
            }
        }
        return NextResponse.json({ error: 'All AI providers failed.' }, { status: 503 });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
