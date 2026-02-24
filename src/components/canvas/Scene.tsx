'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
// @ts-ignore
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Universe from './Universe';
import CentralStar from './CentralStar';
import PlanetSystem from './PlanetSystem';

export default function Scene() {
    return (
        <div className='absolute inset-0 z-0 h-screen w-full bg-[#02050a]'>
            <Canvas
                camera={{ position: [0, 50, 100], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: false, // Turn off antialias when using postprocessing for better performance, or use SMAA
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
            >
                <Suspense fallback={null}>
                    <Universe />
                    <ambientLight intensity={0.1} color="#ffffff" />
                    {/* The Sun's core light - made slightly harsher for space realism */}
                    <pointLight position={[0, 0, 0]} intensity={3} color="#ffedd5" distance={150} decay={2} />

                    <CentralStar />
                    <PlanetSystem />

                    <EffectComposer disableNormalPass>
                        <Bloom
                            luminanceThreshold={1.0}
                            mipmapBlur
                            intensity={1.5}
                            radius={0.8}
                        />
                    </EffectComposer>

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        maxDistance={250}
                        minDistance={15}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
