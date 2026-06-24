/**
 * Web Audio naturalizer chain — single shared chain for all chunks.
 *
 * IMPORTANT: The chain (EQ → compressor → reverb → destination) is built ONCE
 * per AudioContext and reused for every sentence chunk. Previously each chunk
 * created a new chain, so reverb tails from chunk N and the audio from chunk
 * N+1 both connected to destination simultaneously → words piling on top.
 * With a shared chain the reverb tail naturally transitions into the next
 * sentence exactly as it would through a hardware reverb unit.
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
    let chainInput: AudioNode | null = null; // reused across all chunks
    let activeSource: AudioBufferSourceNode | null = null;
    let activeLfo: OscillatorNode | null = null;
    let startCb: (() => void) | null = null;
    let endCb: (() => void) | null = null;

    const queue: Array<{ samples: Float32Array; sampleRate: number }> = [];
    let isPlaying = false;
    let generation = 0;

    function ensureCtx(): { ctx: AudioContext; input: AudioNode } {
        if (!ctx || ctx.state === 'closed') {
            ctx = new AudioContext();
            chainInput = buildChain(ctx); // build chain once per context
        }
        if (ctx.state === 'suspended') ctx.resume();
        return { ctx, input: chainInput! };
    }

    function playChunk(samples: Float32Array, sampleRate: number) {
        const myGen = generation;
        const { ctx: c, input } = ensureCtx();

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
            try { lfo.stop(); } catch { /* ignore */ }
            try { source.disconnect(); } catch { /* ignore */ }
            if (generation !== myGen) return;
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
        playChunk(item.samples, item.sampleRate);
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
