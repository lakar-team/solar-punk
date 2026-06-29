/**
 * Kokoro-js 1.x WASM neural TTS hook.
 *
 * Device strategy: WASM only, always.
 *
 * WebGPU was tried and caused a hard reliability problem: on Windows, the
 * ONNX WebGPU backend JIT-compiles shaders on the first inference. That
 * compilation takes 1-5 seconds of continuous GPU work, which triggers
 * Windows TDR (Timeout Detection and Recovery). TDR resets ALL GPU contexts
 * including the Three.js WebGL context, causing the 3D solar system to go
 * black and log "THREE.WebGLRenderer: Context Lost". fp16 reduces memory but
 * does NOT reduce shader compilation time — the root cause. The only fix is
 * to not use WebGPU while WebGL is active. Since we cannot coordinate between
 * the Three.js scene and this hook without major architecture changes, WASM
 * is the correct permanent choice. It works on every browser (Chrome, Firefox,
 * Safari, Edge), on every GPU, without driver dependency.
 *
 * WASM performance with warmup:
 *  - First sentence after model load: ~200-500ms (WASM kernels already JIT'd
 *    by the silent warmup inference run immediately after model load).
 *  - Subsequent sentences: ~100-300ms on modern hardware.
 *  That is fast enough for conversational TTS on a portfolio site.
 *
 * Other design choices:
 *  - warmup() is called by AiboPanel on first panel open (user gesture), not
 *    on mount. This defers model download until after the user has interacted,
 *    satisfying Chrome's AudioContext autoplay policy and not competing with
 *    the Three.js scene loading on page boot.
 *  - loadModel() uses a promise ref for deduplication so concurrent calls
 *    (warmup + first speak()) share one download.
 *  - Text is preprocessed before TTS: markdown stripped (avoids the model
 *    saying "asterisk asterisk"), then split into sentences. Each sentence is
 *    generated independently so one phonemizer failure doesn't cut off the
 *    rest of the response.
 *  - Sentence splitting avoids common abbreviations (Dr., Mr., vs., etc.)
 *    by requiring the token after a period to start with a capital letter.
 *    Exclamation marks and question marks always end a sentence.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createNaturalizer, type Naturalizer } from '@/utils/audioNaturalizer';

export interface KokoroTTSState {
    speak: (text: string) => Promise<void>;
    speakQueue: (text: string) => void;
    stop: () => void;
    warmup: () => void;
    loading: boolean;
    progress: number;
    isSpeaking: boolean;
    error: string | null;
}

const VOICE = 'af_heart';

/**
 * Strip markdown so the TTS model doesn't read formatting characters aloud.
 * The system prompt tells the AI not to use markdown, but free-form LLMs
 * sometimes include it anyway. This is a safety net, not a parser.
 */
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')     // **bold**
        .replace(/\*(.*?)\*/g, '$1')          // *italic*
        .replace(/__(.*?)__/g, '$1')          // __bold__
        .replace(/_(.*?)_/g, '$1')            // _italic_
        .replace(/`{1,3}[^`]*`{1,3}/g, '')   // `code` / ```block```
        .replace(/^#+\s+/gm, '')             // ## headings
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // [link](url) -> link text
        .replace(/^[-*]\s+/gm, '')           // - bullet lists
        .replace(/^\d+\.\s+/gm, '')          // 1. numbered lists
        .trim();
}

/**
 * Split into TTS-ready sentences.
 *
 * Rules (in order of precedence):
 *  1. ! and ? always end a sentence (they are unambiguous).
 *  2. … always ends a sentence.
 *  3. A period ends a sentence only when followed by whitespace + an
 *     uppercase letter — this avoids splitting on abbreviations like
 *     "Dr. Smith", "vs. the", "e.g. this", version numbers "v2.0 released".
 *  4. Two or more consecutive newlines (paragraph break) always split.
 */
function splitSentences(text: string): string[] {
    const clean = stripMarkdown(text);
    if (!clean) return [];

    // Replace sentence boundaries with a sentinel we can split on cleanly.
    const delimited = clean
        // Unambiguous: !  ? or … followed by whitespace
        .replace(/([!?…])\s+/g, '$1\x00')
        // Period followed by whitespace + uppercase (excludes abbreviations)
        .replace(/\.\s+(?=[A-Z])/g, '.\x00')
        // Paragraph breaks
        .replace(/\n\n+/g, '\x00');

    return delimited
        .split('\x00')
        .map(s => s.trim())
        .filter(s => s.length > 2); // discard empty or single-char fragments
}

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipelineRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadingPromiseRef = useRef<Promise<any> | null>(null);
    const naturalizerRef = useRef<Naturalizer | null>(null);
    const speakAbortRef = useRef<AbortController | null>(null);
    // Generation counter: incremented on stop() to cancel in-flight speakQueue calls.
    const responseGenRef = useRef(0);
    const genQueueRef = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        if (!naturalizerRef.current) {
            naturalizerRef.current = createNaturalizer();
            naturalizerRef.current.onStart(() => setIsSpeaking(true));
            naturalizerRef.current.onEnd(() => setIsSpeaking(false));
        }
    }, []);

    const loadModel = useCallback(async () => {
        if (pipelineRef.current) return pipelineRef.current;
        if (loadingPromiseRef.current) return loadingPromiseRef.current;

        loadingPromiseRef.current = (async () => {
            setLoading(true);
            setProgress(0);
            setError(null);
            try {
                const { KokoroTTS } = await import('kokoro-js');
                const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                    dtype: 'q8',
                    device: 'wasm',
                    progress_callback: (info) => {
                        if ('progress' in info && typeof info.progress === 'number') {
                            setProgress(Math.round(info.progress));
                        }
                    },
                });

                setProgress(100);
                setLoading(false);

                // JIT-compile WASM kernels with a silent warmup inference.
                // Without this, the first real sentence pays a 2-4s compilation
                // penalty on WASM. The warmup audio is discarded.
                try { await tts.generate('Hi', { voice: VOICE }); } catch { /* ignore */ }

                pipelineRef.current = tts;
                return tts;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load voice model';
                setError(msg);
                setLoading(false);
                loadingPromiseRef.current = null; // allow retry on next speak()
                throw err;
            }
        })();

        return loadingPromiseRef.current;
    }, []);

    // Called by AiboPanel when the panel first opens (the "Ask Aibo" click is
    // a user gesture). This starts the model download racing the greeting API
    // call, while ensuring the AudioContext is not created before user interaction.
    const warmup = useCallback(() => {
        loadModel().catch(() => {});
    }, [loadModel]);

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;

        speakAbortRef.current?.abort();
        const abort = new AbortController();
        speakAbortRef.current = abort;

        try {
            const tts = await loadModel();
            const sentences = splitSentences(text);

            for (const sentence of sentences) {
                if (abort.signal.aborted) break;
                try {
                    const result = await tts.generate(sentence, { voice: VOICE });
                    if (!abort.signal.aborted) {
                        naturalizerRef.current?.enqueue(result.audio, result.sampling_rate);
                    }
                } catch {
                    // A single sentence failed (phonemizer error, unsupported chars).
                    // Log nothing — skip it and continue with the next sentence.
                }
            }
        } catch (err) {
            if (abort.signal.aborted) return;
            const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
            setError(msg);
            setIsSpeaking(false);
            console.error('[Kokoro TTS]', err);
        }
    }, [loadModel]);

    // speakQueue: enqueue a single sentence for generation without aborting
    // any in-flight generation from the same response. Calls chain sequentially
    // so WASM inference is never concurrent. stop() increments responseGenRef to
    // cancel all pending speakQueue calls for the current response.
    const speakQueue = useCallback((text: string): void => {
        if (!text.trim()) return;
        const myGen = responseGenRef.current;
        genQueueRef.current = genQueueRef.current.then(async () => {
            if (responseGenRef.current !== myGen) return;
            try {
                const tts = await loadModel();
                if (responseGenRef.current !== myGen) return;
                const result = await tts.generate(text, { voice: VOICE });
                if (responseGenRef.current === myGen) {
                    naturalizerRef.current?.enqueue(result.audio, result.sampling_rate);
                }
            } catch { /* ignore single-sentence generation failures */ }
        });
    }, [loadModel]);

    const stop = useCallback(() => {
        responseGenRef.current++;       // cancel all pending speakQueue calls
        speakAbortRef.current?.abort();
        naturalizerRef.current?.stop();
    }, []);

    return { speak, speakQueue, stop, warmup, loading, progress, isSpeaking, error };
}
