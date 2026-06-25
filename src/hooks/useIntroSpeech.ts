/**
 * Plays the pre-generated intro speech MP3.
 * The file lives at /public/intro-speech.mp3 — no loading delay.
 * Falls back gracefully if the file is missing.
 */
'use client';
import { useRef, useState, useCallback } from 'react';

export function useIntroSpeech() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const play = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (!audioRef.current) {
            audioRef.current = new Audio('/intro-speech.mp3');
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onerror = () => setIsPlaying(false);
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }, []);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setIsPlaying(false);
    }, []);

    return { play, stop, isPlaying };
}
