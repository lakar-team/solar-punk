'use client';

import { Stars } from '@react-three/drei';

export default function Universe() {
    return (
        <>
            <color attach="background" args={['#050b14']} />
            <Stars
                radius={300}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
            <fog attach="fog" args={['#050b14', 50, 300]} />
        </>
    );
}
