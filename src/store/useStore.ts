import { create } from 'zustand';
import * as THREE from 'three';

type ViewMode = 'solar' | 'lunar';

interface AppState {
    viewMode: ViewMode;
    activePlanetId: string | null;    // Opens HUD detail panel
    focusedPlanetId: string | null;   // Legacy — kept for nav panel compat
    focusedCategoryId: string | null; // Which category planet is drilled into
    cameraMode: 'orbit' | 'travel' | 'focus';
    planetPositions: Record<string, THREE.Vector3>;
    introComplete: boolean;           // True after intro animation finishes

    setViewMode: (mode: ViewMode) => void;
    setActivePlanet: (id: string | null) => void;
    setFocusedPlanet: (id: string | null) => void;
    setFocusedCategory: (id: string | null) => void;
    setCameraMode: (mode: 'orbit' | 'travel' | 'focus') => void;
    setPlanetPosition: (id: string, position: THREE.Vector3) => void;
    returnToSolar: () => void;
    setIntroComplete: () => void;
}

export const useStore = create<AppState>((set) => ({
    viewMode: 'solar',
    activePlanetId: null,
    focusedPlanetId: null,
    focusedCategoryId: null,
    cameraMode: 'orbit',
    planetPositions: {},
    introComplete: false,

    setViewMode: (mode) => set({ viewMode: mode }),
    setActivePlanet: (id) => set({ activePlanetId: id }),
    setFocusedPlanet: (id) => set({ focusedPlanetId: id, cameraMode: id ? 'focus' : 'orbit' }),
    setFocusedCategory: (id) => set({ focusedCategoryId: id }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
    setPlanetPosition: (id, position) => set((state) => ({
        planetPositions: { ...state.planetPositions, [id]: position.clone() },
    })),
    returnToSolar: () => set({
        viewMode: 'solar',
        focusedCategoryId: null,
        focusedPlanetId: null,
        activePlanetId: null,
        cameraMode: 'orbit',
    }),
    setIntroComplete: () => set({ introComplete: true }),
}));
