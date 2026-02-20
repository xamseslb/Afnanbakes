/**
 * AdminCalendar — Oversikt over kapasitet og blokkerte dager.
 * Admin kan se bestillinger per dag, blokkere/avblokkere dager,
 * og navigere mellom måneder.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Lock,
    Unlock,
    CalendarDays,
    X,
    Package,
    User,
    Clock,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    fetchAvailability,
    blockDate,
    unblockDate,
    formatNorwegianDate,
    type DateAvailability,
    MAX_ORDERS_PER_DAY,
} from '@/lib/calendarService';
import { fetchOrders, statusLabels, statusColors, type OrderRow } from '@/lib/adminService';

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS_NB = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

export default function AdminCalendar() {
    const [availability, setAvailability] = useState<DateAvailability[]>([]);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [avail, allOrders] = await Promise.all([
            fetchAvailability(),
            fetchOrders(),
        ]);
        setAvailability(avail);
        setOrders(allOrders);
        setLoading(false);
    }

    // Oppslagstabell: dato → DateAvailability
    const availabilityMap = useMemo(() => {
        const map: Record<string, DateAvailability> = {};
        availability.forEach((a) => { map[a.date] = a; });
        return map;
    }, [availability]);

    // Bestillinger per dato
    const ordersByDate = useMemo(() => {
        const map: Record<string, OrderRow[]> = {};
        orders.forEach((o) => {
            if (o.delivery_date && o.status !== 'cancelled') {
                if (!map[o.delivery_date]) map[o.delivery_date] = [];
                map[o.delivery_date].push(o);
            }
        });
        return map;
    }, [orders]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Kalender-dager
    const calendarDays = useMemo(() => {
        const year = currentMonth.year;
        const month = currentMonth.month;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days: (null | { date: Date; dateStr: string })[] = [];
        for (let i = 0; i < startOffset; i++) days.push(null);

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ date, dateStr });
        }

        return days;
    }, [currentMonth]);

    function prevMonth() {
        setCurrentMonth((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
    }

    function nextMonth() {
        setCurrentMonth((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
    }

    async function handleBlock(dateStr: string) {
        setActionLoading(true);
        await blockDate(dateStr, 'Manuelt blokkert av admin');
        await loadData();
        setActionLoading(false);
    }

    async function handleUnblock(dateStr: string) {
        setActionLoading(true);
        await unblockDate(dateStr);
        await loadData();
        setActionLoading(false);
    }

    // Valgt dato info
    const selectedInfo = selectedDate ? availabilityMap[selectedDate] : null;
    const selectedOrders = selectedDate ? (ordersByDate[selectedDate] || []) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overskrift */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-primary" />
                    Kalender
                </h1>
                <p className="text-muted-foreground mt-1">
                    Administrer kapasitet og blokkering av dager. Maks {MAX_ORDERS_PER_DAY} bestillinger per dag.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kalender */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                        {/* Månedsnavigasjon */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                            <button
                                onClick={prevMonth}
                                className="p-2 rounded-xl hover:bg-muted transition-colors"
                                title="Forrige måned"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="font-serif text-xl font-semibold text-foreground">
                                {MONTHS_NB[currentMonth.month]} {currentMonth.year}
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="p-2 rounded-xl hover:bg-muted transition-colors"
                                title="Neste måned"
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
                        <div className="grid grid-cols-7 gap-1.5 px-4 pb-5">
                            {calendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} />;

                                const avail = availabilityMap[day.dateStr];
                                const count = avail?.orderCount || 0;
                                const isBlocked = avail?.isBlocked || false;
                                const isFull = avail?.status === 'full';
                                const isPast = day.date < today;
                                const isSelected = selectedDate === day.dateStr;
                                const isToday = day.date.getTime() === today.getTime();

                                let bgColor = 'bg-emerald-50 hover:bg-emerald-100 text-foreground';
                                if (isPast) bgColor = 'bg-muted/20 text-muted-foreground/40';
                                else if (isBlocked) bgColor = 'bg-red-100 text-red-700 ring-1 ring-red-200';
                                else if (isFull) bgColor = 'bg-amber-100 text-amber-800 ring-1 ring-amber-200';
                                else if (count > 0) bgColor = 'bg-emerald-50 text-foreground ring-1 ring-emerald-200';

                                if (isSelected) bgColor = 'bg-primary text-primary-foreground ring-2 ring-primary';

                                return (
                                    <button
                                        key={day.dateStr}
                                        onClick={() => setSelectedDate(day.dateStr)}
                                        className={`
                                            relative aspect-square rounded-xl flex flex-col items-center justify-center
                                            text-sm font-medium transition-all duration-200 cursor-pointer
                                            ${bgColor}
                                            ${isToday && !isSelected ? 'ring-2 ring-primary/40' : ''}
                                        `}
                                        title={
                                            isBlocked ? `Blokkert`
                                                : isPast ? 'Forbi'
                                                    : `${count}/${MAX_ORDERS_PER_DAY} bestillinger`
                                        }
                                    >
                                        <span className={`text-sm ${isToday && !isSelected ? 'font-bold' : ''}`}>
                                            {day.date.getDate()}
                                        </span>
                                        {!isPast && (
                                            <span className={`text-[10px] leading-none mt-0.5 ${isSelected ? 'text-primary-foreground/70' : isBlocked ? 'text-red-500' : 'text-muted-foreground'
                                                }`}>
                                                {isBlocked ? (
                                                    <Lock className="w-2.5 h-2.5" />
                                                ) : (
                                                    `${count}/${MAX_ORDERS_PER_DAY}`
                                                )}
                                            </span>
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
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                Full
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                Blokkert
                            </span>
                        </div>
                    </div>
                </div>

                {/* Høyre panel — Valgt dag */}
                <div>
                    <AnimatePresence mode="wait">
                        {selectedDate ? (
                            <motion.div
                                key={selectedDate}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {/* Dato-header */}
                                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-serif text-lg font-semibold text-foreground capitalize">
                                            {formatNorwegianDate(selectedDate)}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="text-muted-foreground hover:text-foreground"
                                            title="Lukk"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedInfo?.status === 'blocked'
                                            ? 'bg-red-100 text-red-700'
                                            : selectedInfo?.status === 'full'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {selectedInfo?.status === 'blocked'
                                                ? '🔒 Blokkert'
                                                : selectedInfo?.status === 'full'
                                                    ? '🔴 Full kapasitet'
                                                    : `✅ Ledig (${selectedInfo?.orderCount || 0}/${MAX_ORDERS_PER_DAY})`
                                            }
                                        </span>
                                    </div>

                                    {/* Blokker/Avblokker-knapp */}
                                    {selectedInfo?.isBlocked ? (
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                            onClick={() => handleUnblock(selectedDate)}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Unlock className="w-4 h-4" />
                                            )}
                                            Fjern blokkering
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl gap-2 border-red-300 text-red-700 hover:bg-red-50"
                                            onClick={() => handleBlock(selectedDate)}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Lock className="w-4 h-4" />
                                            )}
                                            Blokker denne dagen
                                        </Button>
                                    )}
                                </div>

                                {/* Bestillinger for valgt dag */}
                                <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                                    <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5" />
                                            Bestillinger ({selectedOrders.length})
                                        </p>
                                    </div>
                                    {selectedOrders.length === 0 ? (
                                        <div className="p-5 text-center text-sm text-muted-foreground">
                                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Ingen bestillinger denne dagen
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/30">
                                            {selectedOrders.map((order) => (
                                                <div key={order.id} className="px-5 py-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-mono text-xs font-bold text-primary">
                                                            {order.order_ref}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status]}`}>
                                                            {statusLabels[order.status]}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                        <User className="w-3 h-3 text-muted-foreground" />
                                                        {order.customer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {order.occasion} • {order.package_name || order.product_type || 'Eget design'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 text-center"
                            >
                                <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">
                                    Klikk på en dag for å se detaljer og administrere
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
