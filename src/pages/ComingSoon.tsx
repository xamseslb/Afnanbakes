/**
 * ComingSoon — Vises for alle besøkende når VITE_COMING_SOON=true.
 * Admin-ruter er alltid tilgjengelige uavhengig av denne siden.
 */
import { useState, useEffect } from 'react';

const LAUNCH_DATE = new Date('2026-04-27T10:00:00');

function useCountdown(target: Date) {
    const calc = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}

function CountBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-white/60 font-medium">{label}</span>
        </div>
    );
}

export default function ComingSoon() {
    const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1030 40%, #1a0a1e 100%)',
            }}
        >
            {/* Bakgrunns-blob */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(216,131,166,0.18) 0%, transparent 70%)',
                }}
            />

            {/* Dekorative sirkler */}
            <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-400/5 blur-3xl" />
            <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-400/5 blur-3xl" />

            {/* Logo */}
            <div className="relative mb-8">
                <h1
                    className="text-5xl md:text-7xl font-serif font-bold tracking-tight"
                    style={{
                        background: 'linear-gradient(135deg, #f4a7c3 0%, #d585a6 40%, #c06ba0 70%, #a855b5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 32px rgba(216,131,166,0.4))',
                    }}
                >
                    AfnanBakes
                </h1>
                <p className="text-white/50 text-sm uppercase tracking-[0.3em] mt-2 font-light">
                    Håndlagde kaker · Skapt med kjærlighet
                </p>
            </div>

            {/* Tagline */}
            <p className="text-white/80 text-lg md:text-xl max-w-md mb-12 leading-relaxed font-light">
                Noe søtt er på vei. Vi gleder oss til å dele våre kaker med deg snart.
            </p>

            {/* Nedteller */}
            <div className="flex gap-4 md:gap-6 mb-14">
                <CountBox value={days} label="Dager" />
                <CountBox value={hours} label="Timer" />
                <CountBox value={minutes} label="Min" />
                <CountBox value={seconds} label="Sek" />
            </div>

            {/* Dekorativt logo-element */}
            <div className="w-full max-w-xs flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-3xl">🎂</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>
                <p className="text-white/40 text-xs uppercase tracking-[0.25em] font-light">
                    Håndlagde kaker siden 2024
                </p>
            </div>

            {/* Instagram */}
            <a
                href="https://www.instagram.com/afnanbakes"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-12 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @afnanbakes
            </a>

            {/* Bunntekst */}
            <p className="absolute bottom-6 text-white/20 text-xs">
                © {new Date().getFullYear()} AfnanBakes
            </p>
        </div>
    );
}
