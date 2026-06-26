/**
 * Web Audio naturalizer chain — single shared chain for all chunks.
 *
 * Architecture note: the processing chain (EQ -> compressor -> reverb ->
 * destination) is built ONCE per AudioContext and reused for all sentence
 * chunks. A per-chunk chain caused reverb tails from chunk N to overlap
 * with chunk N+1 audio, making words pile on top of each other. With a
 * shared chain the reverb tail transitions naturally into the next sentence.
 *
 * Reliability:
 *  - AudioContext is created lazily on first enqueue (never on page load).
 *    Callers must ensure first enqueue follows a user gesture so Chrome's
 *    autoplay policy allows the context to start in running state.
 *  - If AudioContext creation fails (unsupported browser, page-level block),
 *    ensureCtx throws a descriptive error that surfaces in the TTS hook's
 *    error state, showing "Voice unavailable — text only" in the UI.
 *  - stop() uses generation counters so stale onended callbacks from stopped
 *    playback never trigger playNext on a new playback session.
 */

export interface Naturalizer {
    play: (samples: Float32Array, sampleRate: number) => void;
    enqueue: (samples: Float32Array, sampleRate: number) => void;
    stop: () => void;
    onStart: (cb: () => void) => void;
    onEnd: (cb: () => void) => void;
}

function buildRoomIR(ctx: AudioContext, duration = 0.4, decay = 2.5): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * duration);
    const ir = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = ir.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    return ir;
}

function buildChain(ctx: AudioContext): AudioNode {
    const warmth = ctx.createBiquadFilter();
    warmth.type = 'peaking';
    warmth.frequency.value = 260;
    warmth.Q.value = 0.8;
    warmth.gain.value = 3.5;

    const deHarsh = ctx.createBiquadFilter();
    deHarsh.type = 'peaking';
    deHarsh.frequency.value = 3400;
    deHarsh.Q.value = 1.0;
    deHarsh.gain.value = -3.0;

    const air = ctx.createBiquadFilter();
    air.type = 'highshelf';
    air.frequency.value = 8000;
    air.gain.value = 1.5;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 8;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;

    const reverb = ctx.createConvolver();
    reverb.buffer = buildRoomIR(ctx);

    const dryGain = ctx.createGain(); dryGain.gain.value = 0.82;
    const wetGain = ctx.createGain(); wetGain.gain.value = 0.18;
    const master = ctx.createGain(); master.gain.value = 0.96;

    warmth.connect(deHarsh);
    deHarsh.connect(air);
    air.connect(comp);
    comp.connect(dryGain);
    comp.connect(reverb);
    reverb.connect(wetGain);
    dryGain.connect(master);
    wetGain.connect(master);
    master.connect(ctx.destination);

    return warmth; // input node
}

export function createNaturalizer(): Naturalizer {
    let ctx: AudioContext | null = null;
    let chainInput: AudioNode | null = null;
    let activeSource: AudioBufferSourceNode | null = null;
    let activeLfo: OscillatorNode | null = null;
    let startCb: (() => void) | null = null;
    let endCb: (() => void) | null = null;

    const queue: Array<{ samples: Float32Array; sampleRate: number }> = [];
    let isPlaying = false;
    let generation = 0;

    function ensureCtx(): { ctx: AudioContext; input: AudioNode } {
        if (!ctx || ctx.state === 'closed') {
            // Throws if AudioContext is not supported or blocked at the browser
            // level. The error propagates through playChunk -> enqueue -> speak(),
            // where useKokoroTTS catches it and sets error state ("Voice unavailable").
            try {
                ctx = new AudioContext();
            } catch (e) {
                throw new Error(
                    'AudioContext unavailable: ' + (e instanceof Error ? e.message : String(e))
                );
            }
            chainInput = buildChain(ctx);
        }
        // Resume if suspended (e.g. browser paused it on tab switch).
        // Not awaited because: (a) Chrome doesn't advance currentTime while
        // suspended, so source.start() queues correctly and plays on resume;
        // (b) making the whole chain async for a no-op in the common path
        // adds complexity with no practical benefit.
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        return { ctx, input: chainInput! };
    }

    function playChunk(samples: Float32Array, sampleRate: number) {
        const myGen = generation;
        const { ctx: c, input } = ensureCtx(); // may throw — propagates to caller

        const buf = c.createBuffer(1, samples.length, sampleRate);
        buf.copyToChannel(new Float32Array(samples), 0);

        const source = c.createBufferSource();
        source.buffer = buf;

        // Micro-pitch wobble: 4.2 Hz LFO ±10 cents
        const lfo = c.createOscillator();
        const lfoGain = c.createGain();
        lfo.frequency.value = 4.2;
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(source.detune);
        lfo.start();

        source.connect(input);

        source.onended = () => {
            try { lfo.stop(); } catch { /* already stopped */ }
            try { source.disconnect(); } catch { /* already disconnected */ }
            if (generation !== myGen) return; // this playback session was stopped
            activeSource = null;
            activeLfo = null;
            playNext();
        };

        activeSource = source;
        activeLfo = lfo;
        source.start();
    }

    function playNext() {
        if (!isPlaying) return;
        if (queue.length === 0) {
            isPlaying = false;
            endCb?.();
            return;
        }
        const item = queue.shift()!;
        try {
            playChunk(item.samples, item.sampleRate);
        } catch {
            // AudioContext failed mid-queue — drain remaining and signal end
            queue.length = 0;
            isPlaying = false;
            endCb?.();
        }
    }

    function enqueue(samples: Float32Array, sampleRate: number) {
        queue.push({ samples, sampleRate });
        if (!isPlaying) {
            isPlaying = true;
            startCb?.();
            playNext();
        }
    }

    function play(samples: Float32Array, sampleRate: number) {
        stop();
        enqueue(samples, sampleRate);
    }

    function stop() {
        generation++;
        queue.length = 0;
        try { activeSource?.stop(); } catch { /* ignore */ }
        try { activeLfo?.stop(); } catch { /* ignore */ }
        activeSource = null;
        activeLfo = null;
        if (isPlaying) {
            isPlaying = false;
            endCb?.();
        }
    }

    return {
        play,
        enqueue,
        stop,
        onStart: (cb) => { startCb = cb; },
        onEnd: (cb) => { endCb = cb; },
    };
}
