/**
 * DatePickerSection — Kalender for å velge leveringsdato.
 * Viser 60 dager fremover med grønn/rød/grå fargekoding.
 * Grønn = ledig, Rød = opptatt (≥3 bestillinger eller blokkert), Grå = fortid.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAvailability, formatNorwegianDate, type DateAvailability } from '@/lib/calendarService';

interface DatePickerSectionProps {
    selectedDate: string;
    onSelect: (date: string) => void;
    onContinue: () => void;
}

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS_NB = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

export function DatePickerSection({ selectedDate, onSelect, onContinue }: DatePickerSectionProps) {
    const [availability, setAvailability] = useState<DateAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    useEffect(() => {
        loadAvailability();
    }, []);

    async function loadAvailability() {
        setLoading(true);
        const data = await fetchAvailability();
        setAvailability(data);
        setLoading(false);
    }

    // Bygg oppslagstabell: dato → DateAvailability
    const availabilityMap = useMemo(() => {
        const map: Record<string, DateAvailability> = {};
        availability.forEach((a) => { map[a.date] = a; });
        return map;
    }, [availability]);

    // I dag (uten tid)
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Generer kalender-dager for gjeldende måned
    const calendarDays = useMemo(() => {
        const year = currentMonth.year;
        const month = currentMonth.month;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Norsk uke starter på mandag (1=man, 7=søn)
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days: (null | { date: Date; dateStr: string })[] = [];

        // Tomme celler før første dag
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        // Dagene i måneden
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = formatDateStr(date);
            days.push({ date, dateStr });
        }

        return days;
    }, [currentMonth]);

    // Navigasjon: kan vi gå til forrige/neste måned?
    const canGoPrev = useMemo(() => {
        const prev = new Date(currentMonth.year, currentMonth.month - 1, 1);
        return prev.getFullYear() >= today.getFullYear() && prev.getMonth() >= today.getMonth()
            || prev.getFullYear() > today.getFullYear();
    }, [currentMonth, today]);

    const canGoNext = useMemo(() => {
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 60);
        return new Date(currentMonth.year, currentMonth.month + 1, 1) <= maxDate;
    }, [currentMonth, today]);

    function prevMonth() {
        if (!canGoPrev) return;
        setCurrentMonth((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
    }

    function nextMonth() {
        if (!canGoNext) return;
        setCurrentMonth((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
    }

    function getDayStatus(dateStr: string, date: Date): 'past' | 'available' | 'full' | 'blocked' {
        // I dag og fortid
        if (date <= today) return 'past';

        // Utenfor 60-dagers vinduet
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 60);
        if (date > maxDate) return 'past';

        const avail = availabilityMap[dateStr];
        if (!avail) return 'available'; // Hvis ingen data, anta ledig
        return avail.status;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                    Velg leveringsdato
                </h2>
                <p className="text-muted-foreground text-lg">
                    Når ønsker du å motta bestillingen?
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden"
            >
                {/* Månedsnavigasjon */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                    <button
                        onClick={prevMonth}
                        disabled={!canGoPrev}
                        className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Forrige måned"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                        {MONTHS_NB[currentMonth.month]} {currentMonth.year}
                    </h3>
                    <button
                        onClick={nextMonth}
                        disabled={!canGoNext}
                        className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Neste måned"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Ukedager */}
                <div className="grid grid-cols-7 px-4 pt-3">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Datoer */}
                <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                    {calendarDays.map((day, i) => {
                        if (!day) {
                            return <div key={`empty-${i}`} />;
                        }

                        const status = getDayStatus(day.dateStr, day.date);
                        const isSelected = selectedDate === day.dateStr;
                        const isAvailable = status === 'available';
                        const isFull = status === 'full' || status === 'blocked';
                        const isPast = status === 'past';

                        return (
                            <button
                                key={day.dateStr}
                                onClick={() => isAvailable && onSelect(day.dateStr)}
                                disabled={!isAvailable}
                                className={`
                                    relative aspect-square rounded-xl flex items-center justify-center
                                    text-sm font-medium transition-all duration-200
                                    ${isSelected
                                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 shadow-md'
                                        : isAvailable
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-sm cursor-pointer'
                                            : isFull
                                                ? 'bg-red-50 text-red-400 cursor-not-allowed'
                                                : isPast
                                                    ? 'text-muted-foreground/30 cursor-not-allowed'
                                                    : ''
                                    }
                                `}
                                title={
                                    isSelected ? 'Valgt dato'
                                        : isAvailable ? 'Ledig'
                                            : isFull ? 'Opptatt'
                                                : 'Ikke tilgjengelig'
                                }
                            >
                                {day.date.getDate()}
                                {isFull && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                                )}
                                {isAvailable && !isSelected && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Forklaring */}
                <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Ledig
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        Opptatt
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        Valgt
                    </span>
                </div>
            </motion.div>

            {/* Valgt dato-bekreftelse */}
            {selectedDate && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                >
                    <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Valgt leveringsdato</p>
                        <p className="text-lg font-serif font-semibold text-foreground capitalize">
                            {formatNorwegianDate(selectedDate)}
                        </p>
                    </div>

                    <Button
                        onClick={onContinue}
                        className="w-full rounded-full"
                        size="lg"
                    >
                        Fortsett
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

/** Formatterer Date til YYYY-MM-DD */
function formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
