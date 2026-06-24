'use client';

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';

interface VrmViewerProps {
    onLoaded?: (vrm: VRM) => void;
    isEmbedded?: boolean;
}

export interface VrmViewerHandle {
    speakWithLipSync: (text: string) => void;
    setFacingDirection: (direction: 'front' | 'back') => void;
}

const VrmViewer = forwardRef<VrmViewerHandle, VrmViewerProps>(({ onLoaded, isEmbedded }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const vrmRef = useRef<VRM | null>(null);
    const isSpeakingRef = useRef(false);
    const targetRotationRef = useRef<number>(Math.PI); // Default: facing front (model is rotated 180°)

    // Expose functions to parent
    useImperativeHandle(ref, () => ({
        speakWithLipSync: (text: string) => {
            isSpeakingRef.current = true;
            const duration = Math.min(text.length * 80, 10000);
            setTimeout(() => {
                isSpeakingRef.current = false;
            }, duration);
        },
        setFacingDirection: (direction: 'front' | 'back') => {
            // 'front': face camera (rotation.y = Math.PI)
            // 'back': face away (rotation.y = 0)
            targetRotationRef.current = direction === 'front' ? Math.PI : 0;
        }
    }));

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 20.0);
        // Initial camera position
        // isEmbedded: zoom out more (z=1.4) and aim higher to lower avatar (y=1.5)
        // Main: zoom out more (z=1.75) and aim higher (y=1.5)
        if (isEmbedded) {
            camera.position.set(0.0, 1.5, 1.4);
        } else {
            camera.position.set(0.0, 1.5, 1.75);
        }

        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(1.0, 1.0, 1.0).normalize();
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Load VRM
        const loader = new GLTFLoader();
        loader.register((parser: unknown) => {
            return new VRMLoaderPlugin(parser as ConstructorParameters<typeof VRMLoaderPlugin>[0]);
        });

        loader.load(
            '/avatar.vrm',
            (gltf) => {
                const vrm = gltf.userData.vrm as VRM;
                VRMUtils.removeUnnecessaryVertices(gltf.scene);
                VRMUtils.combineSkeletons(gltf.scene);
                vrm.scene.rotation.y = Math.PI;
                scene.add(vrm.scene);
                vrmRef.current = vrm;
                if (onLoaded) onLoaded(vrm);
            },
            (progress) => console.log('Loading avatar: ' + (100.0 * progress.loaded / progress.total).toFixed(2) + '%'),
            (error) => console.error('Failed to load avatar:', error)
        );

        // Animation state
        const clock = new THREE.Clock();
        let animationId: number;
        let blinkTimer = 0;
        let nextBlinkTime = Math.random() * 3 + 2; // Random blink every 2-5 seconds
        let isBlinking = false;
        let blinkProgress = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            if (vrmRef.current) {
                const vrm = vrmRef.current;
                vrm.update(delta);

                // === SMOOTH ROTATION TO TARGET ===
                // Lerp the model's Y rotation toward the target (for facing front/back)
                const currentRotation = vrm.scene.rotation.y;
                const targetRotation = targetRotationRef.current;
                const rotationDiff = targetRotation - currentRotation;
                if (Math.abs(rotationDiff) > 0.01) {
                    vrm.scene.rotation.y += rotationDiff * 0.05; // Smooth lerp factor
                }

                // === NATURAL BODY SWAY ===
                // Gentle swaying motion using sine waves
                const swayAmount = 0.02;
                const swaySpeed = 0.5;
                if (vrm.humanoid) {
                    const spine = vrm.humanoid.getNormalizedBoneNode('spine');
                    if (spine) {
                        spine.rotation.z = Math.sin(elapsed * swaySpeed) * swayAmount;
                        spine.rotation.x = Math.sin(elapsed * swaySpeed * 0.7) * swayAmount * 0.5;
                    }
                    const head = vrm.humanoid.getNormalizedBoneNode('head');
                    if (head) {
                        head.rotation.y = Math.sin(elapsed * swaySpeed * 0.3) * swayAmount * 0.5;
                    }

                    // === ARM ANIMATIONS (fix T-pose) ===
                    // Lower arms to a natural resting position
                    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
                    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
                    const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
                    const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

                    if (leftUpperArm) {
                        // Rest position + gentle sway
                        leftUpperArm.rotation.z = 1.2 + Math.sin(elapsed * swaySpeed * 0.8) * 0.03;
                        leftUpperArm.rotation.x = Math.sin(elapsed * swaySpeed * 0.5) * 0.02;
                    }
                    if (rightUpperArm) {
                        rightUpperArm.rotation.z = -1.2 + Math.sin(elapsed * swaySpeed * 0.8 + 0.5) * 0.03;
                        rightUpperArm.rotation.x = Math.sin(elapsed * swaySpeed * 0.5 + 0.3) * 0.02;
                    }
                    if (leftLowerArm) {
                        leftLowerArm.rotation.y = -0.3 + Math.sin(elapsed * swaySpeed * 0.6) * 0.02;
                    }
                    if (rightLowerArm) {
                        rightLowerArm.rotation.y = 0.3 + Math.sin(elapsed * swaySpeed * 0.6 + 0.2) * 0.02;
                    }
                }

                // === NATURAL BLINKING ===
                blinkTimer += delta;
                if (!isBlinking && blinkTimer >= nextBlinkTime) {
                    isBlinking = true;
                    blinkProgress = 0;
                }

                if (isBlinking) {
                    blinkProgress += delta * 8; // Blink speed
                    const blinkValue = blinkProgress < 0.5
                        ? blinkProgress * 2 // Closing
                        : 2 - blinkProgress * 2; // Opening

                    vrm.expressionManager?.setValue('blink', Math.max(0, Math.min(1, blinkValue)));

                    if (blinkProgress >= 1) {
                        isBlinking = false;
                        blinkTimer = 0;
                        nextBlinkTime = Math.random() * 3 + 2; // Reset random interval
                        vrm.expressionManager?.setValue('blink', 0);
                    }
                }

                // === LIP SYNC (when speaking) ===
                if (isSpeakingRef.current) {
                    // Simulate mouth movement with varying vowel shapes
                    const mouthOpenAmount = (Math.sin(elapsed * 12) + 1) * 0.3 + 0.1;
                    const aaAmount = (Math.sin(elapsed * 15) + 1) * 0.25;
                    const ohAmount = (Math.cos(elapsed * 10) + 1) * 0.15;

                    vrm.expressionManager?.setValue('aa', aaAmount);
                    vrm.expressionManager?.setValue('oh', ohAmount);
                    vrm.expressionManager?.setValue('ee', (Math.sin(elapsed * 8) + 1) * 0.1);
                } else {
                    // Reset mouth when not speaking
                    vrm.expressionManager?.setValue('aa', 0);
                    vrm.expressionManager?.setValue('oh', 0);
                    vrm.expressionManager?.setValue('ee', 0);
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current) return;
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        const currentContainer = containerRef.current;
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (currentContainer && currentContainer.contains(renderer.domElement)) {
                currentContainer.removeChild(renderer.domElement);
            }
        };
    }, [onLoaded, isEmbedded]);

    return <div ref={containerRef} className="h-full w-full" />;
});

VrmViewer.displayName = 'VrmViewer';

export default VrmViewer;
