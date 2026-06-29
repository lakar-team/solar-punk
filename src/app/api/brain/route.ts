import { projects } from '@/data/projects';
import { adamNarrative, siteMap } from '@/data/adamProfile';

export const runtime = 'edge';

interface ConversationTurn {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
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

function parseStructuredReply(raw: string): { reply: string; planet: string | null } {
    const stripped = raw
        .replace(/```json[\s\S]*?```/gi, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim();

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

    return { reply: stripped, planet: null };
}

// Extracts clean reply text from the model's raw streaming output.
// Models are instructed to reply with {"reply":"...","planet":...}.
// Some ignore this and return plain text — both modes are handled.
// Only the reply content is forwarded as stream tokens so TTS never
// sees raw JSON characters like braces or the "reply" key.
class ReplyExtractor {
    private buf = '';
    private state: 'init' | 'json-scan' | 'json-content' | 'json-done' | 'plain' = 'init';

    feed(chunk: string): string {
        this.buf += chunk;

        if (this.state === 'init') {
            const t = this.buf.trimStart();
            if (t.length === 0) return '';
            this.state = t[0] === '{' ? 'json-scan' : 'plain';
        }

        if (this.state === 'plain') {
            const out = this.buf;
            this.buf = '';
            return out;
        }

        if (this.state === 'json-scan') {
            const m = this.buf.match(/"reply"\s*:\s*"/);
            if (!m || m.index === undefined) return ''; // still scanning
            this.buf = this.buf.slice(m.index + m[0].length);
            this.state = 'json-content';
        }

        if (this.state === 'json-content') {
            let out = '';
            let i = 0;
            while (i < this.buf.length) {
                const c = this.buf[i];
                if (c === '\\' && i + 1 < this.buf.length) {
                    const n = this.buf[i + 1];
                    out += n === 'n' ? '\n' : n === 't' ? '\t' : n;
                    i += 2;
                } else if (c === '"') {
                    this.state = 'json-done';
                    this.buf = this.buf.slice(i + 1);
                    break;
                } else {
                    out += c;
                    i++;
                }
            }
            if (this.state === 'json-content') this.buf = '';
            return out;
        }

        return '';
    }
}

// FIX 3: turnIndex > 0 cuts ~1500 tokens by replacing the full adamNarrative
// and siteMap with a one-paragraph summary on follow-up turns.
function buildSystemPrompt(activePlanetId: string | null, turnIndex: number): string {
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;

    const planetContext = activePlanet
        ? `Background: the visitor has the "${activePlanet.name}" planet panel open. Use this as context if their question is about it, but follow their lead -- answer what they actually ask, not what the open panel is about.`
        : 'The visitor is browsing the solar system overview.';

    const adamSection = turnIndex === 0
        ? `════════════════════════════════════════
EVERYTHING YOU KNOW ABOUT ADAM:
════════════════════════════════════════
${adamNarrative}

════════════════════════════════════════
PORTFOLIO MAP:
════════════════════════════════════════
${siteMap}`
        : `════════════════════════════════════════
ADAM SUMMARY (full profile already shared this session):
════════════════════════════════════════
Adam Raman: Malaysian architect-turned-technologist, Sendai Japan. Founder of Lakar Design (2012–2022), 4 years PhD research at Tohoku University (building energy/passive dehumidification, ongoing R&D with the university), now building energy consultant at Refil Japan.

Valid planet IDs: hydrocalc | phd-research | sa-architects | lakar-design | smart-home | cultural-engagement | project-aibo | adamtool | demon-hunter | momotaro-book | redbubble-shop | nature-vibe-channel | islamic-advisor`;

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

${adamSection}

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

// FIX 1: Gemini first, gemini-2.0-flash model, streaming endpoint.
async function* streamGemini(messages: ConversationMessage[]): AsyncGenerator<string> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY not configured');

    const sysMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: chatMessages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                })),
                systemInstruction: sysMsg ? { parts: [{ text: sysMsg.content }] } : undefined,
                generationConfig: { maxOutputTokens: 600, temperature: 0.85 },
            }),
        }
    );

    if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini ${response.status}: ${errText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const json = line.slice(5).trim();
            if (!json || json === '[DONE]') continue;
            try {
                const ev = JSON.parse(json) as {
                    candidates?: { content?: { parts?: { text?: string }[] } }[];
                    error?: { message: string };
                };
                if (ev.error) throw new Error(ev.error.message);
                const text = ev.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
            } catch (e) {
                if (e instanceof Error && e.message.startsWith('Gemini')) throw e;
                // skip malformed SSE lines
            }
        }
    }
}

// FIX 2: OpenRouter with stream: true.
async function* streamOpenRouter(messages: ConversationMessage[]): AsyncGenerator<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    const MODELS = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-chat-v3-0324:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'openrouter/auto',
    ];

    for (const model of MODELS) {
        let yielded = false;
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://solar-punk-five.vercel.app',
                    'X-Title': 'Solar Punk Portfolio -- Web Witch',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model, messages, stream: true }),
            });

            if (!response.ok || !response.body) continue;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let done = false;

            while (!done) {
                const { done: rdone, value } = await reader.read();
                if (rdone) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';
                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const json = line.slice(5).trim();
                    if (json === '[DONE]') { done = true; break; }
                    if (!json) continue;
                    try {
                        const ev = JSON.parse(json) as {
                            choices?: { delta?: { content?: string } }[];
                            error?: { message: string };
                        };
                        if (ev.error) continue;
                        const text = ev.choices?.[0]?.delta?.content;
                        if (text) { yielded = true; yield text; }
                    } catch { /* skip */ }
                }
            }

            if (yielded) return;
        } catch (err) {
            if (yielded) throw err; // already sent chunks — can't fall back
            continue;
        }
    }

    throw new Error('All OpenRouter models failed');
}

export async function POST(req: Request): Promise<Response> {
    try {
        const { message, activePlanetId, history } = await req.json() as {
            message: string;
            activePlanetId?: string | null;
            history?: ConversationTurn[];
        };

        if (!message || typeof message !== 'string' || message.length > 2000) {
            return new Response(JSON.stringify({ error: 'Invalid message' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const rawHistory = (history ?? []).map(m => ({
            role: m.role,
            content: parseStructuredReply(m.content).reply,
        }));
        const firstUser = rawHistory.findIndex(m => m.role === 'user');
        const cleanHistory = firstUser >= 0 ? rawHistory.slice(firstUser) : [];

        // FIX 3: count prior user turns to decide prompt verbosity.
        const turnIndex = cleanHistory.filter(m => m.role === 'user').length;

        const messages: ConversationMessage[] = [
            { role: 'system', content: buildSystemPrompt(activePlanetId ?? null, turnIndex) },
            ...(cleanHistory as ConversationMessage[]),
            { role: 'user', content: message },
        ];

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (obj: object) =>
                    controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

                // FIX 1: Gemini first, OpenRouter fallback.
                const providers = [
                    { name: 'Google Gemini', model: 'gemini-2.0-flash', gen: () => streamGemini(messages) },
                    { name: 'OpenRouter',    model: 'openrouter',        gen: () => streamOpenRouter(messages) },
                ];

                for (const provider of providers) {
                    const extractor = new ReplyExtractor();
                    let fullRaw = '';

                    try {
                        for await (const chunk of provider.gen()) {
                            fullRaw += chunk;
                            const extracted = extractor.feed(chunk);
                            if (extracted) send({ t: extracted });
                        }
                    } catch {
                        if (fullRaw) {
                            // Partial response received — send what we have.
                            const { reply, planet } = parseStructuredReply(fullRaw);
                            send({ done: true, reply: reply || 'Something interrupted my crystal ball...', planet, model: provider.model, provider: provider.name });
                            controller.close();
                            return;
                        }
                        continue; // nothing sent yet, try next provider
                    }

                    if (fullRaw) {
                        const { reply, planet } = parseStructuredReply(fullRaw);
                        send({ done: true, reply, planet, model: provider.model, provider: provider.name });
                        controller.close();
                        return;
                    }
                }

                send({ error: 'All AI providers failed.' });
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
        });
    } catch (error: unknown) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
