'use client';

import { useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

const SOLAR_POS = new THREE.Vector3(0, 28, 115);
const SOLAR_LOOK = new THREE.Vector3(0, 0, 0);

export default function CameraController() {
    const { viewMode, focusedCategoryId, planetPositions } = useStore();

    const targetPos = useRef(new THREE.Vector3(0, 28, 115));
    const targetLook = useRef(new THREE.Vector3(0, 0, 0));

    useFrame((state, delta) => {
        const cam = state.camera;
        // @ts-ignore
        const controls = state.controls as any;

        if (viewMode === 'lunar' && focusedCategoryId && planetPositions[focusedCategoryId]) {
            const p = planetPositions[focusedCategoryId];
            targetLook.current.copy(p);
            // Offset: close enough to see moons at radius ~13, but give the planet room
            targetPos.current.set(p.x + 18, p.y + 14, p.z + 24);
        } else {
            targetPos.current.lerp(SOLAR_POS, 2.5 * delta);
            targetLook.current.lerp(SOLAR_LOOK, 2.5 * delta);
        }

        cam.position.lerp(targetPos.current, 4 * delta);

        if (controls?.target) {
            controls.target.lerp(targetLook.current, 4 * delta);
            controls.update();
        }
    });

    useEffect(() => {
        if (viewMode === 'solar') {
            targetPos.current.copy(SOLAR_POS);
            targetLook.current.copy(SOLAR_LOOK);
        }
    }, [viewMode]);

    return null;
}
