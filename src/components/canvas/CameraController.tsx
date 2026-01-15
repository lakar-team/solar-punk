'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { projects } from '@/data/projects';

export default function CameraController() {
    const { activePlanetId, cameraMode, setCameraMode } = useStore();
    const { camera, controls } = useThree();

    // Target position and focus
    const targetPos = useRef(new THREE.Vector3(0, 50, 100));
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
    });

    useEffect(() => {
        if (activePlanetId) {
            // Find the planet's location
            // Note: This is tricky because planets are moving in the Scene state, 
            // but we need their location here. 
            // A better approach for a real app is to have the Planet component update a ref in the store,
            // OR just calculate the position based on time if we know the orbit logic triggers here.
            // For simplicity in this v1, checking the project data and approximations.

            const project = projects.find(p => p.id === activePlanetId);
            if (project) {
                // We know the Planet component calculates position as:
                // x = cos(angle) * r, z = sin(angle) * r
                // But we don't know the exact current angle without syncing.
                // STRATEGY CHANGE: The Planet component should tell us where it is, 
                // OR we make the CameraController purely reactive to a "Focus Target" provided by the Scene.

                // Actually, for this "Travel" effect, let's just move the camera CLOSE to the orbit radius
                // and let the user fine-tune, OR disable orbit rotation when focused.

                // Simpler for now: "View Mode" - move camera to a fixed offset relative to the planet's ORBIT.
                // Since we can't easily query the exact mesh position from here without refs,
                // we'll rely on the Planet component to call `controls.fitToBox` or similar if we used Drei's specific tools.

                // Let's try a different approach:
                // When a planet is clicked, it sets the "Target" in the store.
                // We can't interpolate to a MOVING target easily without the ref.

                // REFACTOR: We'll put the camera logic INSIDE the Planet component temporarily when active?
                // No, that's messy.

                // Better: store the `Ref<THREE.Group>` of the planet in a map in the store?
                // Or just let the camera be loose.
            }
        } else {
            // Reset to overview
            targetPos.current.set(0, 60, 90); // High angle
            targetLookAt.current.set(0, 0, 0); // Look at sun
        }
    }, [activePlanetId]);

    return null;
}
