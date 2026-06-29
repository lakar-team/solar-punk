// Runs inside a Web Worker — no DOM, no React, no AudioContext.
// Receives: { type: 'warmup' } | { type: 'speak', id: number, sentences: string[], voice: string }
// Sends:    { type: 'ready' } | { type: 'audio', id: number, index: number, samples: Float32Array, sampleRate: number }
//         | { type: 'done', id: number } | { type: 'error', id: number, message: string }

import { KokoroTTS } from 'kokoro-js';

// Cast self to any to avoid dom vs. webworker lib type conflict.
// The tsconfig only includes "dom" but this file runs in a worker context.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _self = self as any;

type InMessage =
    | { type: 'warmup' }
    | { type: 'speak'; id: number; sentences: string[]; voice: string };

let tts: InstanceType<typeof KokoroTTS> | null = null;
let loadPromise: Promise<void> | null = null;

async function loadModel(): Promise<void> {
    if (tts) return;
    if (loadPromise) { await loadPromise; return; }
    loadPromise = (async () => {
        tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
            dtype: 'q8',
            device: 'wasm',
        });
        // Warmup inference to JIT-compile WASM kernels — warmup audio is discarded.
        try { await tts.generate('Hi', { voice: 'af_heart' }); } catch { /* ignore */ }
    })();
    await loadPromise;
    _self.postMessage({ type: 'ready' });
}

_self.onmessage = async (e: MessageEvent) => {
    const msg = e.data as InMessage;

    if (msg.type === 'warmup') {
        await loadModel().catch(err => {
            _self.postMessage({ type: 'error', id: -1, message: String(err) });
        });
        return;
    }

    if (msg.type === 'speak') {
        const { id, sentences, voice } = msg;
        try {
            await loadModel();
            for (let i = 0; i < sentences.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (tts as any).generate(sentences[i], { voice });
                // Copy the buffer before transferring to avoid detaching the original.
                const copy = new Float32Array(result.audio.buffer.slice(0));
                _self.postMessage(
                    { type: 'audio', id, index: i, samples: copy, sampleRate: result.sampling_rate },
                    [copy.buffer]
                );
            }
            _self.postMessage({ type: 'done', id });
        } catch (err) {
            _self.postMessage({ type: 'error', id, message: String(err) });
        }
    }
};
