/**
 * ProductOrderSection — Alt-i-ett bestillingsside.
 * Erstatter PackageSection + DatePickerSection + DetailsSection + SummarySection.
 * Kunden velger størrelse, smak, farge, bilde-tillegg, dato og fyller inn kontaktinfo — alt på én side.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ruler, Palette, Droplets, ImagePlus, CalendarDays,
    User, Mail, Phone, Upload, X, ChevronLeft, ChevronRight,
    Check, Loader2, ShoppingBag, Camera, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    OrderData, Occasion, occasionLabels,
    CAKE_SIZES, CAKE_FLAVORS, CAKE_COLORS, PHOTO_ADDON_PRICE,
    CakeSize, CakeFlavor, CakeColor,
} from '@/lib/orderTypes';
import { fetchAvailability, formatNorwegianDate, type DateAvailability } from '@/lib/calendarService';

interface ProductOrderSectionProps {
    occasion: Occasion;
    orderData: OrderData;
    onUpdate: (data: Partial<OrderData>) => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS_NB = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function ProductOrderSection({
    occasion,
    orderData,
    onUpdate,
    onConfirm,
    isSubmitting,
}: ProductOrderSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Kalender-logikk ──
    const [availability, setAvailability] = useState<DateAvailability[]>([]);
    const [calLoading, setCalLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    useEffect(() => {
        (async () => {
            setCalLoading(true);
            const data = await fetchAvailability();
            setAvailability(data);
            setCalLoading(false);
        })();
    }, []);

    const availabilityMap = useMemo(() => {
        const map: Record<string, DateAvailability> = {};
        availability.forEach((a) => { map[a.date] = a; });
        return map;
    }, [availability]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

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
            days.push({ date, dateStr: formatDateStr(date) });
        }
        return days;
    }, [currentMonth]);

    const canGoPrev = useMemo(() => {
        const prev = new Date(currentMonth.year, currentMonth.month - 1, 1);
        return (prev.getFullYear() >= today.getFullYear() && prev.getMonth() >= today.getMonth()) || prev.getFullYear() > today.getFullYear();
    }, [currentMonth, today]);

    const canGoNext = useMemo(() => {
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 60);
        return new Date(currentMonth.year, currentMonth.month + 1, 1) <= maxDate;
    }, [currentMonth, today]);

    function getDayStatus(dateStr: string, date: Date) {
        if (date <= today) return 'past';
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 60);
        if (date > maxDate) return 'past';
        const avail = availabilityMap[dateStr];
        if (!avail) return 'available';
        return avail.status;
    }

    // ── Bilde-opplasting ──
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        onUpdate({ images: [...orderData.images, ...files] });
    };
    const removeImage = (index: number) => {
        onUpdate({ images: orderData.images.filter((_, i) => i !== index) });
    };

    // ── Beregn totalpris ──
    const basePrice = orderData.selectedSize?.price || 0;
    const photoAddon = orderData.withPhoto ? PHOTO_ADDON_PRICE : 0;
    const totalPrice = basePrice + photoAddon;

    // ── Validering ──
    const isValid =
        orderData.selectedSize !== null &&
        orderData.selectedFlavor !== null &&
        orderData.selectedColor !== null &&
        orderData.deliveryDate.trim() !== '' &&
        orderData.customerName.trim() !== '' &&
        orderData.customerEmail.trim() !== '' &&
        orderData.customerPhone.trim() !== '';

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {occasionLabels[occasion]}-kake
                </h2>
                <p className="text-muted-foreground text-lg">
                    Tilpass kaken din og bestill
                </p>
            </motion.div>

            <div className="space-y-8">
                {/* ── 1. Størrelse ── */}
                <Section icon={<Ruler className="w-5 h-5" />} title="Størrelse" delay={0.05}>
                    <div className="grid grid-cols-2 gap-3">
                        {CAKE_SIZES.map((size) => (
                            <button
                                key={size.id}
                                onClick={() => onUpdate({ selectedSize: size })}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                                    "hover:border-primary/50 hover:shadow-sm",
                                    orderData.selectedSize?.id === size.id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-card"
                                )}
                            >
                                <p className="font-semibold text-foreground">{size.label}</p>
                                <p className="text-sm text-muted-foreground">{size.persons}</p>
                                <p className="text-lg font-bold text-primary mt-1">
                                    {size.price.toLocaleString('nb-NO')} kr
                                </p>
                            </button>
                        ))}
                    </div>
                </Section>

                {/* ── 2. Smak ── */}
                <Section icon={<Droplets className="w-5 h-5" />} title="Smak" delay={0.1}>
                    <div className="grid grid-cols-3 gap-2">
                        {CAKE_FLAVORS.map((flavor) => (
                            <button
                                key={flavor.id}
                                onClick={() => onUpdate({ selectedFlavor: flavor })}
                                className={cn(
                                    "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                                    "hover:border-primary/50",
                                    orderData.selectedFlavor?.id === flavor.id
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-card text-foreground"
                                )}
                            >
                                {flavor.label}
                            </button>
                        ))}
                    </div>
                </Section>

                {/* ── 3. Farge ── */}
                <Section icon={<Palette className="w-5 h-5" />} title="Farge" delay={0.15}>
                    <div className="flex flex-wrap gap-3">
                        {CAKE_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => onUpdate({ selectedColor: color })}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                                    "hover:border-primary/50",
                                    orderData.selectedColor?.id === color.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-card"
                                )}
                            >
                                <span
                                    className="w-5 h-5 rounded-full border border-border/50"
                                    style={{ backgroundColor: color.hex }}
                                />
                                {color.label}
                            </button>
                        ))}
                    </div>
                </Section>

                {/* ── 4. Spiselig bilde ── */}
                <Section icon={<Camera className="w-5 h-5" />} title="Spiselig bilde" delay={0.2}>
                    <button
                        onClick={() => onUpdate({ withPhoto: !orderData.withPhoto })}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                            orderData.withPhoto
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card hover:border-primary/30"
                        )}
                    >
                        <div className="text-left">
                            <p className="font-semibold text-foreground">Legg til spiselig bilde</p>
                            <p className="text-sm text-muted-foreground">
                                Eget bilde printet på spiselig papir og lagt på kaken
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">+{PHOTO_ADDON_PRICE} kr</span>
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                orderData.withPhoto
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border"
                            )}>
                                {orderData.withPhoto && <Check className="w-4 h-4" />}
                            </div>
                        </div>
                    </button>
                </Section>

                {/* ── 5. Tekst på kaken ── */}
                <Section icon={<Type className="w-5 h-5" />} title="Tekst på kaken" delay={0.22}>
                    <Input
                        placeholder="F.eks. «Gratulerer med dagen, Lisa!»"
                        value={orderData.cakeText}
                        onChange={(e) => onUpdate({ cakeText: e.target.value })}
                        className="rounded-xl"
                    />
                </Section>

                {/* ── 6. Leveringsdato ── */}
                <Section icon={<CalendarDays className="w-5 h-5" />} title="Leveringsdato" delay={0.25}>
                    {calLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                            {/* Månedsnavigasjon */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                                <button
                                    onClick={() => setCurrentMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })}
                                    disabled={!canGoPrev}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="font-serif font-semibold">
                                    {MONTHS_NB[currentMonth.month]} {currentMonth.year}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })}
                                    disabled={!canGoNext}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Ukedager */}
                            <div className="grid grid-cols-7 px-3 pt-2">
                                {WEEKDAYS.map((d) => (
                                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                                ))}
                            </div>
                            {/* Datoer */}
                            <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                                {calendarDays.map((day, i) => {
                                    if (!day) return <div key={`e-${i}`} />;
                                    const status = getDayStatus(day.dateStr, day.date);
                                    const isSelected = orderData.deliveryDate === day.dateStr;
                                    const isAvailable = status === 'available';
                                    const isFull = status === 'full' || status === 'blocked';
                                    return (
                                        <button
                                            key={day.dateStr}
                                            onClick={() => isAvailable && onUpdate({ deliveryDate: day.dateStr })}
                                            disabled={!isAvailable}
                                            className={cn(
                                                "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                                                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 shadow-sm",
                                                !isSelected && isAvailable && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer",
                                                isFull && "bg-red-50 text-red-400 cursor-not-allowed",
                                                status === 'past' && "text-muted-foreground/30 cursor-not-allowed",
                                            )}
                                        >
                                            {day.date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Forklaring */}
                            <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-center gap-5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Ledig</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Opptatt</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Valgt</span>
                            </div>
                        </div>
                    )}
                    {orderData.deliveryDate && (
                        <p className="text-sm text-primary font-medium mt-2 text-center">
                            Valgt: {formatNorwegianDate(orderData.deliveryDate)}
                        </p>
                    )}
                </Section>

                {/* ── 7. Bildeopplasting ── */}
                <Section icon={<Upload className="w-5 h-5" />} title="Inspirasjonsbilder (valgfritt)" delay={0.3}>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                        <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Klikk for å laste opp bilder
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    {orderData.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {orderData.images.map((file, i) => (
                                <div key={i} className="relative group">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Bilde ${i + 1}`}
                                        className="w-16 h-16 object-cover rounded-lg border border-border"
                                    />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* ── 8. Beskrivelse ── */}
                <Section icon={<Type className="w-5 h-5" />} title="Ønsker / beskrivelse (valgfritt)" delay={0.32}>
                    <Textarea
                        placeholder="Beskriv ønskene dine her..."
                        value={orderData.description}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        className="rounded-xl min-h-[80px]"
                    />
                </Section>

                {/* ── 9. Kontaktinfo ── */}
                <Section icon={<User className="w-5 h-5" />} title="Kontaktinfo" delay={0.35}>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="name" className="text-sm mb-1 block">Navn *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Ditt fulle navn"
                                    value={orderData.customerName}
                                    onChange={(e) => onUpdate({ customerName: e.target.value })}
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-sm mb-1 block">E-post *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="din@epost.no"
                                    value={orderData.customerEmail}
                                    onChange={(e) => onUpdate({ customerEmail: e.target.value })}
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-sm mb-1 block">Telefon *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+47 XXX XX XXX"
                                    value={orderData.customerPhone}
                                    onChange={(e) => onUpdate({ customerPhone: e.target.value })}
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ── Prisoppsummering + bestill ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card border border-border/50 rounded-2xl p-6 shadow-soft"
                >
                    <h3 className="font-serif text-lg font-bold text-foreground mb-4">Oppsummering</h3>
                    <div className="space-y-2 text-sm">
                        {orderData.selectedSize && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kake ({orderData.selectedSize.persons})</span>
                                <span className="font-medium">{orderData.selectedSize.price.toLocaleString('nb-NO')} kr</span>
                            </div>
                        )}
                        {orderData.selectedFlavor && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Smak</span>
                                <span className="font-medium">{orderData.selectedFlavor.label}</span>
                            </div>
                        )}
                        {orderData.selectedColor && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Farge</span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <span className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: orderData.selectedColor.hex }} />
                                    {orderData.selectedColor.label}
                                </span>
                            </div>
                        )}
                        {orderData.withPhoto && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Spiselig bilde</span>
                                <span className="font-medium">+{PHOTO_ADDON_PRICE} kr</span>
                            </div>
                        )}
                        {orderData.cakeText && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tekst</span>
                                <span className="font-medium truncate max-w-[180px]">«{orderData.cakeText}»</span>
                            </div>
                        )}
                        {orderData.deliveryDate && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Levering</span>
                                <span className="font-medium">{formatNorwegianDate(orderData.deliveryDate)}</span>
                            </div>
                        )}
                        <div className="border-t border-border/50 pt-3 mt-3 flex justify-between text-lg">
                            <span className="font-bold text-foreground">Totalt</span>
                            <span className="font-bold text-primary">{totalPrice.toLocaleString('nb-NO')} kr</span>
                        </div>
                    </div>

                    <Button
                        onClick={onConfirm}
                        disabled={!isValid || isSubmitting}
                        size="lg"
                        className="w-full mt-6 rounded-full gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Behandler...
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-5 h-5" />
                                Bestill — {totalPrice.toLocaleString('nb-NO')} kr
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}

/* ── Section wrapper ── */
function Section({ icon, title, delay, children }: { icon: React.ReactNode; title: string; delay: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="text-primary">{icon}</div>
                <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}
