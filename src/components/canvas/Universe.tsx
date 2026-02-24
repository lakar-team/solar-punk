'use client';

import { Stars } from '@react-three/drei';

export default function Universe() {
    return (
        <>
            <color attach="background" args={['#02040a']} />

            {/* Distant faint background stars */}
            <Stars radius={400} depth={100} count={8000} factor={2} saturation={0.5} fade speed={0.5} />

            {/* Mid-ground stars, slightly larger, some colored */}
            <Stars radius={250} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />

            {/* Close, bright distinct stars */}
            <Stars radius={150} depth={20} count={500} factor={6} saturation={0} fade speed={2} />

            <fog attach="fog" args={['#02040a', 80, 400]} />
        </>
    );
}
