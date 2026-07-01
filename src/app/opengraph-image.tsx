import { ImageResponse } from 'next/og';

export const alt = 'Adam M. Raman — Architect, Technologist, Innovation Specialist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#07080a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '72px 80px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Amber glow top-right */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-160px',
                        right: '-160px',
                        width: '700px',
                        height: '700px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.04) 50%, transparent 70%)',
                    }}
                />
                {/* Faint grid lines */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(245,158,11,0.04) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                    }}
                />
                {/* Bottom accent bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(to right, rgba(245,158,11,0.9) 0%, rgba(245,158,11,0.2) 60%, transparent 100%)',
                    }}
                />

                {/* Site URL — top left */}
                <div
                    style={{
                        position: 'absolute',
                        top: '48px',
                        left: '80px',
                        fontSize: '14px',
                        color: 'rgba(245,158,11,0.5)',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        display: 'flex',
                    }}
                >
                    solar-punk-five.vercel.app
                </div>

                {/* Name */}
                <div
                    style={{
                        fontSize: '88px',
                        fontWeight: 900,
                        color: 'white',
                        lineHeight: 0.88,
                        marginBottom: '28px',
                        display: 'flex',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Adam M. Raman
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: '24px',
                        color: 'rgba(251,191,36,0.75)',
                        letterSpacing: '0.06em',
                        display: 'flex',
                    }}
                >
                    Architect · Technologist · Innovation Specialist
                </div>
            </div>
        ),
        { ...size }
    );
}
