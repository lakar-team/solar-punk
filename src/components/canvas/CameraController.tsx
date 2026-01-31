'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export default function CameraController() {
    const { focusedPlanetId, planetPositions } = useStore();
    const { controls } = useThree();

    // Target position and focus
    const targetPos = useRef(new THREE.Vector3(0, 60, 90));
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

    useFrame((state, delta) => {
        // Smoothly interpolate camera position
        state.camera.position.lerp(targetPos.current, 3 * delta);

        // Smoothly interpolate controls target (lookAt)
        // @ts-ignore - orbit controls reference
        const currentLookAt = (controls as any)?.target as THREE.Vector3;
        if (currentLookAt) {
            currentLookAt.lerp(targetLookAt.current, 3 * delta);
            // @ts-ignore
            controls?.update();
        }

        // If focused on a planet, continuously update target to follow it
        if (focusedPlanetId && planetPositions[focusedPlanetId]) {
            const planetPos = planetPositions[focusedPlanetId];
            targetLookAt.current.copy(planetPos);
            // Position camera at an offset from the planet
            targetPos.current.set(
                planetPos.x + 15,
                planetPos.y + 12,
                planetPos.z + 20
            );
        }
    });

    useEffect(() => {
        if (focusedPlanetId) {
            // When a planet is focused, the useFrame will handle the continuous tracking
            // Initial target will be set in useFrame based on planetPositions
        } else {
            // Reset to overview
            targetPos.current.set(0, 60, 90); // High angle
            targetLookAt.current.set(0, 0, 0); // Look at sun
        }
    }, [focusedPlanetId]);

    return null;
}
