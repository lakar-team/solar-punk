import { create } from 'zustand';
import * as THREE from 'three';

interface AppState {
    activePlanetId: string | null;
    cameraMode: 'orbit' | 'travel' | 'focus';
    setActivePlanet: (id: string | null) => void;
    setCameraMode: (mode: 'orbit' | 'travel' | 'focus') => void;
}

export const useStore = create<AppState>((set) => ({
    activePlanetId: null,
    cameraMode: 'orbit',
    setActivePlanet: (id) => set({ activePlanetId: id }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
}));
