import { create } from 'zustand';
import * as THREE from 'three';

interface AppState {
    activePlanetId: string | null; // Opens HUD
    focusedPlanetId: string | null; // Camera focuses on this planet
    cameraMode: 'orbit' | 'travel' | 'focus';
    planetPositions: Record<string, THREE.Vector3>; // Real-time planet positions
    setActivePlanet: (id: string | null) => void;
    setFocusedPlanet: (id: string | null) => void;
    setCameraMode: (mode: 'orbit' | 'travel' | 'focus') => void;
    setPlanetPosition: (id: string, position: THREE.Vector3) => void;
}

export const useStore = create<AppState>((set) => ({
    activePlanetId: null,
    focusedPlanetId: null,
    cameraMode: 'orbit',
    planetPositions: {},
    setActivePlanet: (id) => set({ activePlanetId: id }),
    setFocusedPlanet: (id) => set({ focusedPlanetId: id, cameraMode: id ? 'focus' : 'orbit' }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
    setPlanetPosition: (id, position) => set((state) => ({
        planetPositions: { ...state.planetPositions, [id]: position.clone() }
    })),
}));
