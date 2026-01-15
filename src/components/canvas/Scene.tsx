'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import Universe from './Universe';
import CentralStar from './CentralStar';
import PlanetSystem from './PlanetSystem';

export default function Scene() {
    return (
        <div className='absolute inset-0 z-0 h-screen w-full bg-slate-900'>
            <Canvas
                camera={{ position: [0, 50, 100], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true }}
            >
                <Suspense fallback={null}>
                    <Universe />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[0, 0, 0]} intensity={2} color="#fdba74" distance={100} decay={2} />

                    <CentralStar />
                    <PlanetSystem />

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        maxDistance={200}
                        minDistance={10}
                    />
                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
