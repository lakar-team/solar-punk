/**
 * One-time script: generate intro-speech.mp3 using Kokoro-js.
 * Run from the repo root: node scripts/generate-intro-audio.mjs
 * Output: public/intro-speech.mp3 — commit this file to the branch.
 */
import { KokoroTTS } from 'kokoro-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const INTRO_TEXT =
  "Welcome. I'm Web Witch — your guide to Adam's universe. " +
  "Each planet you see below is something real that Adam built: " +
  "architecture, research, code, and art. " +
  "Explore on your own, or ask me anything using the Ask Aibo button. " +
  "When you're ready... scroll down.";

console.log('Loading Kokoro model (q8)...');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0', {
  dtype: 'q8',
  device: 'cpu',
  progress_callback: (info) => {
    if ('progress' in info && typeof info.progress === 'number') {
      process.stdout.write(`\r  ${Math.round(info.progress)}%   `);
    }
  },
});

console.log('\nGenerating speech...');
const result = await tts.generate(INTRO_TEXT, { voice: 'af_heart' });
const samples = result.audio;
const sampleRate = result.sampling_rate;

// Build WAV in memory
const dataSize = samples.length * 2;
const buf = Buffer.alloc(44 + dataSize);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataSize, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(dataSize, 40);
for (let i = 0; i < samples.length; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
}

if (!existsSync('public')) mkdirSync('public');
writeFileSync('public/intro-speech.wav', buf);
console.log(`WAV written (${(buf.length / 1024).toFixed(0)} KB)`);

// Convert to MP3 if ffmpeg is available
try {
  execSync('ffmpeg -y -i public/intro-speech.wav -q:a 4 public/intro-speech.mp3', { stdio: 'inherit' });
  execSync('rm public/intro-speech.wav');
  console.log('MP3 ready at public/intro-speech.mp3');
} catch {
  console.log('ffmpeg not found — rename intro-speech.wav to intro-speech.wav and commit as-is, or convert manually.');
}
