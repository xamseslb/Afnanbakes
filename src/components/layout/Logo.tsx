/**
 * Logo — AfnanBakes cupcake logo (line-art style matching brand reference).
 */

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const PINK = '#e8688a';
const PINK_LIGHT = '#f0a0b4';

export function Logo({ size = 'md', className = '' }: LogoProps) {
    const dims = { sm: { w: 120, h: 44 }, md: { w: 160, h: 56 }, lg: { w: 220, h: 76 } };
    const d = dims[size];

    return (
        <div className={`flex-shrink-0 ${className}`}>
            <svg
                width={d.w}
                height={d.h}
                viewBox="0 0 320 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* ── Cupcake icon (left-center area) ── */}
                <g transform="translate(110, 0)">
                    {/* Cupcake wrapper (trapezoid with vertical lines) */}
                    <path
                        d="M30 52 L26 72 L74 72 L70 52 Z"
                        stroke={PINK}
                        strokeWidth="2"
                        fill="none"
                        strokeLinejoin="round"
                    />
                    {/* Wrapper vertical ridges */}
                    <line x1="36" y1="53" x2="34" y2="71" stroke={PINK} strokeWidth="1" opacity="0.5" />
                    <line x1="43" y1="53" x2="42" y2="71" stroke={PINK} strokeWidth="1" opacity="0.5" />
                    <line x1="50" y1="53" x2="50" y2="71" stroke={PINK} strokeWidth="1" opacity="0.5" />
                    <line x1="57" y1="53" x2="58" y2="71" stroke={PINK} strokeWidth="1" opacity="0.5" />
                    <line x1="64" y1="53" x2="66" y2="71" stroke={PINK} strokeWidth="1" opacity="0.5" />

                    {/* Frosting - swirl outline */}
                    <path
                        d="M24 52 C24 46 30 42 36 44 C38 38 44 35 50 37 C54 34 62 34 66 38 C72 36 78 42 76 48 C80 50 78 54 76 52 L24 52Z"
                        stroke={PINK}
                        strokeWidth="2.2"
                        fill="none"
                        strokeLinejoin="round"
                    />

                    {/* Frosting swirl peak */}
                    <path
                        d="M44 37 C44 30 46 22 50 16 C52 13 54 14 54 17 C54 20 52 26 50 30 C48 34 46 36 44 37"
                        stroke={PINK}
                        strokeWidth="2.2"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Swoosh curve underneath */}
                    <path
                        d="M-10 68 C10 60 40 74 60 68 C80 62 100 66 115 64"
                        stroke={PINK}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Sparkle stars */}
                    {/* Top-right sparkle */}
                    <g transform="translate(78, 18)" fill={PINK_LIGHT}>
                        <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" />
                    </g>
                    {/* Top sparkle */}
                    <g transform="translate(64, 8)" fill={PINK_LIGHT}>
                        <path d="M0 -3 L0.7 -0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7 -0.7 Z" />
                    </g>
                    {/* Left sparkle */}
                    <g transform="translate(18, 40)" fill={PINK_LIGHT}>
                        <path d="M0 -3 L0.7 -0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7 -0.7 Z" />
                    </g>
                    {/* Right swoosh sparkle */}
                    <g transform="translate(112, 58)" fill={PINK_LIGHT}>
                        <path d="M0 -3 L0.7 -0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7 -0.7 Z" />
                    </g>
                    {/* Small dot sparkle */}
                    <circle cx="86" cy="28" r="1.2" fill={PINK_LIGHT} />
                    <circle cx="12" cy="48" r="1" fill={PINK_LIGHT} />
                </g>

                {/* ── Text ── */}
                {/* "AFNAN" — elegant uppercase */}
                <text
                    x="160"
                    y="96"
                    textAnchor="middle"
                    fontFamily="'Playfair Display', 'Georgia', serif"
                    fontWeight="500"
                    fontSize="22"
                    letterSpacing="5"
                    fill={PINK}
                >
                    AFNAN
                </text>

                {/* "BAKES" — smaller spaced-out with decorative lines */}
                <g>
                    {/* Left decorative line */}
                    <line x1="118" y1="106" x2="138" y2="106" stroke={PINK} strokeWidth="0.8" opacity="0.6" />
                    {/* Right decorative line */}
                    <line x1="182" y1="106" x2="202" y2="106" stroke={PINK} strokeWidth="0.8" opacity="0.6" />
                    <text
                        x="160"
                        y="109"
                        textAnchor="middle"
                        fontFamily="'Inter', 'Helvetica', sans-serif"
                        fontWeight="400"
                        fontSize="10"
                        letterSpacing="6"
                        fill={PINK}
                        opacity="0.8"
                    >
                        BAKES
                    </text>
                </g>
            </svg>
        </div>
    );
}
