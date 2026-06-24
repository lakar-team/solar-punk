/**
 * Web Audio naturalizer chain.
 * Warmth EQ → De-harsh EQ → Air shelf → Compression → Pitch wobble LFO → Room reverb → Output
 */

export interface Naturalizer {
    play: (samples: Float32Array, sampleRate: number) => void;
    stop: () => void;
    onStart: (cb: () => void) => void;
    onEnd: (cb: () => void) => void;
}

/** Algorithmic room reverb impulse response */
function buildRoomIR(ctx: AudioContext, duration = 0.5, decay = 2.8): AudioBuffer {
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

export function createNaturalizer(): Naturalizer {
    let ctx: AudioContext | null = null;
    let activeSource: AudioBufferSourceNode | null = null;
    let activeLfo: OscillatorNode | null = null;
    let startCb: (() => void) | null = null;
    let endCb: (() => void) | null = null;

    function ensureCtx(): AudioContext {
        if (!ctx || ctx.state === 'closed') ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function buildChain(c: AudioContext): AudioNode {
        // 1. Warmth lift — low-mids
        const warmth = c.createBiquadFilter();
        warmth.type = 'peaking';
        warmth.frequency.value = 260;
        warmth.Q.value = 0.8;
        warmth.gain.value = 3.5;

        // 2. De-harshness — cut grating 3kHz
        const deHarsh = c.createBiquadFilter();
        deHarsh.type = 'peaking';
        deHarsh.frequency.value = 3400;
        deHarsh.Q.value = 1.0;
        deHarsh.gain.value = -3.0;

        // 3. Air shelf — tiny brightness above 8kHz
        const air = c.createBiquadFilter();
        air.type = 'highshelf';
        air.frequency.value = 8000;
        air.gain.value = 1.5;

        // 4. Dynamics compressor
        const comp = c.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.knee.value = 8;
        comp.ratio.value = 3.5;
        comp.attack.value = 0.004;
        comp.release.value = 0.18;

        // 5. Room reverb wet/dry
        const reverb = c.createConvolver();
        reverb.buffer = buildRoomIR(c);

        const dryGain = c.createGain(); dryGain.gain.value = 0.82;
        const wetGain = c.createGain(); wetGain.gain.value = 0.18;
        const master = c.createGain(); master.gain.value = 0.96;

        warmth.connect(deHarsh);
        deHarsh.connect(air);
        air.connect(comp);
        comp.connect(dryGain);
        comp.connect(reverb);
        reverb.connect(wetGain);
        dryGain.connect(master);
        wetGain.connect(master);
        master.connect(c.destination);

        return warmth; // input node
    }

    function play(samples: Float32Array, sampleRate: number) {
        const c = ensureCtx();

        // Stop any existing playback
        try { activeSource?.stop(); } catch { /* ignore */ }
        try { activeLfo?.stop(); } catch { /* ignore */ }
        activeSource = null;
        activeLfo = null;

        const buf = c.createBuffer(1, samples.length, sampleRate);
        buf.copyToChannel(samples, 0);

        const inputNode = buildChain(c);

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

        source.connect(inputNode);
        source.onended = () => {
            try { lfo.stop(); } catch { /* ignore */ }
            activeSource = null;
            activeLfo = null;
            endCb?.();
        };

        activeSource = source;
        activeLfo = lfo;
        startCb?.();
        source.start();
    }

    function stop() {
        try { activeSource?.stop(); } catch { /* ignore */ }
        try { activeLfo?.stop(); } catch { /* ignore */ }
        activeSource = null;
        activeLfo = null;
        endCb?.();
    }

    return {
        play,
        stop,
        onStart: (cb) => { startCb = cb; },
        onEnd: (cb) => { endCb = cb; },
    };
}
