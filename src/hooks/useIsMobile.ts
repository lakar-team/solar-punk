'use client';

import { useState, useEffect } from 'react';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            // Check for override in URL or localStorage
            const params = new URLSearchParams(window.location.search);
            const forceDesktop = params.get('force') === 'desktop' || localStorage.getItem('forceDesktop') === 'true';

            if (forceDesktop) {
                setIsMobile(false);
                return;
            }

            const userAgent = (navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '').toLowerCase();
            const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
            setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}
