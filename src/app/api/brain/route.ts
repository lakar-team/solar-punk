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

// Validated set of planet IDs from projects.ts.
// parseStructuredReply checks against this so the model can't hallucinate an ID.
const VALID_PLANET_IDS = new Set([
    'hydrocalc', 'phd-research', 'sa-architects', 'lakar-design',
    'smart-home', 'cultural-engagement', 'project-aibo', 'adamtool',
    'demon-hunter', 'momotaro-book', 'redbubble-shop',
    'nature-vibe-channel', 'islamic-advisor',
]);

/**
 * Extract reply text and optional planet navigation from the model's response.
 *
 * The system prompt asks for {"reply": "...", "planet": "id-or-null"}.
 * Some free models ignore this and return plain text -- we handle that gracefully.
 * The planet field is validated against VALID_PLANET_IDS so a hallucinated ID
 * never reaches the frontend.
 */
function parseStructuredReply(raw: string): { reply: string; planet: string | null } {
    // Strip any code fences first
    const stripped = raw
        .replace(/```json[\s\S]*?```/gi, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim();

    // Try to extract and parse the outermost JSON object
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
            if (typeof parsed.reply === 'string' && parsed.reply.trim()) {
                const planet =
                    typeof parsed.planet === 'string' && VALID_PLANET_IDS.has(parsed.planet)
                        ? parsed.planet
                        : null;
                return { reply: parsed.reply.trim(), planet };
            }
        } catch { /* fall through to plain text */ }
    }

    // Model returned plain text -- no navigation, use text as-is
    return { reply: stripped, planet: null };
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

    const planetContext = activePlanet
        ? `Background: the visitor has the "${activePlanet.name}" planet panel open. Use this as context if their question is about it, but follow their lead -- answer what they actually ask, not what the open panel is about.`
        : 'The visitor is browsing the solar system overview.';

    return `You are Web Witch -- a mystical AI character who lives inside Adam Raman's portfolio at solar-punk-five.vercel.app. You know Adam deeply and speak about him like someone who has followed his journey closely, not like someone reading his resume.

OUTPUT FORMAT (required):
Respond with JSON only: {"reply": "your response", "planet": "id-or-null"}
- "reply": your plain conversational response. No markdown, no formatting, no JSON inside this string.
- "planet": set to the ID of a planet when your response is focused on a specific project; null otherwise.
  Navigate to a planet when: the visitor asks about a specific project, you are directing them somewhere,
  OR the topic has shifted to a different project from what is currently open -- always follow the visitor's
  interest, not the currently open panel.

Valid planet IDs (use exact strings):
hydrocalc | phd-research | sa-architects | lakar-design | smart-home | cultural-engagement |
project-aibo | adamtool | demon-hunter | momotaro-book | redbubble-shop | nature-vibe-channel | islamic-advisor

YOUR CHARACTER:
- Witchy, warm, slightly mischievous -- but genuinely helpful and never flippant
- You speak conversationally, not in bullet points or structured lists
- When someone asks about Adam, you draw on real knowledge and tell a story, not just facts
- You guide visitors through the solar system portfolio by pointing them to specific planets
- Keep responses concise (3-5 sentences) unless someone asks for detail -- then go deeper

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
- "Where can I find X?" → name the planet and navigate there (set the planet field)
- "What is Adam like?" → draw on his personality, philosophy, sense of humour
- "What is Adam doing now?" → Refil Japan, process automation, building energy systems, living in Sendai
- "Is Adam looking for work?" / "Is he available?" → Yes -- always open to new opportunities and new challenges. He is actively building right now, but he welcomes conversations about roles or collaborations where he can make complex systems more intuitive.
- If asked something you genuinely don't know → say so honestly and offer to redirect

Do not make up facts. If something isn't in your knowledge above, say so.

════════════════════════════════════════
RESPONSE FORMAT — IMPORTANT:
════════════════════════════════════════
Always respond with valid JSON in this exact shape:
{ "reply": "your message here", "planet": null }

When navigating to a planet, set planet to one of these exact IDs (otherwise null):
hydrocalc, phd-research, sa-architects, lakar-design, smart-home, cultural-engagement, project-aibo, adamtool, demon-hunter, momotaro-book, redbubble-shop, nature-vibe-channel, islamic-advisor

Do NOT use orbit numbers anywhere. Return ONLY the raw JSON object, no markdown, no code fences.`;
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

        // Build conversation history. Sanitize stored messages (strips any old JSON
        // artifacts from before this fix). Ensure history starts with a user turn --
        // Gemini rejects contents arrays that begin with model/assistant role.
        const rawHistory = (history ?? []).map(m => ({
            role: m.role,
            content: parseStructuredReply(m.content).reply, // extract just the text
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
                const { reply, planet } = parseStructuredReply(result.reply);
                return NextResponse.json({ reply, planet, model: result.model, provider: provider.name });
            }
        }
        return NextResponse.json({ error: 'All AI providers failed.' }, { status: 503 });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
