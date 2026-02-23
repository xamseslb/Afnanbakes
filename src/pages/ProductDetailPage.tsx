/**
 * ProductDetailPage — Produktside med tilpasning og bestilling.
 * Kunden velger størrelse, smak, farge, bilde-tillegg, tekst, dato og kontaktinfo.
 * Inspirert av soulcake.no sin produktside.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ImageIcon,
    ChevronLeft, ChevronRight, CalendarDays,
    User, Mail, Phone, Upload, X, Check, Loader2, ShoppingBag,
    ImagePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getProductById } from '@/lib/products';
import {
    CAKE_SIZES, CAKE_FLAVORS, CAKE_COLORS, PHOTO_ADDON_PRICE,
} from '@/lib/orderTypes';
import { fetchAvailability, formatNorwegianDate, type DateAvailability } from '@/lib/calendarService';
import { createCheckoutSession, submitOrder } from '@/lib/orderService';
import { useToast } from '@/hooks/use-toast';
import { ProductCategory } from '@/lib/types';

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS_NB = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function toDateStr(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Merk om kaken har størrelses-priser (kaker) eller fast pris (cupcakes/cookies/sabayad) */
function isCakeCategory(cat: string) {
    return cat === 'cakes';
}

export default function ProductDetailPage() {
    const { category, id } = useParams<{ category: string; id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const product = id ? getProductById(Number(id)) : undefined;

    // ── Tilpasning-state ──
    const [selectedSize, setSelectedSize] = useState(CAKE_SIZES[0]);
    const [selectedFlavor, setSelectedFlavor] = useState(CAKE_FLAVORS[0]);
    const [selectedColor, setSelectedColor] = useState(CAKE_COLORS[0]);
    const [withPhoto, setWithPhoto] = useState(false);
    const [cakeText, setCakeText] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [quantity, setQuantity] = useState(product?.minOrder || 1);

    // ── Kontaktinfo ──
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // ── Kalender ──
    const [availability, setAvailability] = useState<DateAvailability[]>([]);
    const [calLoading, setCalLoading] = useState(true);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'customize' | 'confirm'>('customize');

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
        const d = new Date(); d.setHours(0, 0, 0, 0); return d;
    }, []);

    const calendarDays = useMemo(() => {
        const { year, month } = currentMonth;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let offset = firstDay.getDay() - 1;
        if (offset < 0) offset = 6;
        const days: (null | { date: Date; dateStr: string })[] = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push({ date, dateStr: toDateStr(date) });
        }
        return days;
    }, [currentMonth]);

    const canGoPrev = useMemo(() => {
        const prev = new Date(currentMonth.year, currentMonth.month - 1, 1);
        return prev >= new Date(today.getFullYear(), today.getMonth(), 1);
    }, [currentMonth, today]);

    const canGoNext = useMemo(() => {
        const max = new Date(today); max.setDate(max.getDate() + 60);
        return new Date(currentMonth.year, currentMonth.month + 1, 1) <= max;
    }, [currentMonth, today]);

    function getDayStatus(dateStr: string, date: Date) {
        if (date <= today) return 'past';
        const max = new Date(today); max.setDate(max.getDate() + 60);
        if (date > max) return 'past';
        const a = availabilityMap[dateStr];
        if (!a) return 'available';
        return a.status;
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImages((prev) => [...prev, ...Array.from(e.target.files || [])]);
    };

    // Totalprice
    const basePrice = isCakeCategory(category || '')
        ? selectedSize.price
        : (product?.price || 0) * quantity;
    const totalPrice = basePrice + (withPhoto ? PHOTO_ADDON_PRICE : 0);

    const isValid = name.trim() && email.trim() && phone.trim() && deliveryDate;

    const handleOrder = async () => {
        if (!isValid || !product) return;
        setIsSubmitting(true);

        const orderData = {
            occasion: null,
            productType: null,
            selectedPackage: null,
            isCustomDesign: false,
            selectedSize: isCakeCategory(category || '') ? selectedSize : null,
            selectedFlavor,
            selectedColor,
            withPhoto,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            description: [
                description,
                `Produkt: ${product.name}`,
                isCakeCategory(category || '') ? '' : `Antall: ${quantity}`,
            ].filter(Boolean).join(' | '),
            ideas: '',
            cakeName: product.name,
            cakeText,
            quantity: String(quantity),
            deliveryDate,
            images,
        } as const;

        // If has size-based price → Stripe
        if (isCakeCategory(category || '')) {
            const result = await createCheckoutSession(orderData as Parameters<typeof createCheckoutSession>[0]);
            setIsSubmitting(false);
            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                toast({ title: 'Noe gikk galt', description: 'Kunne ikke starte betaling.', variant: 'destructive' });
            }
        } else {
            const result = await submitOrder(orderData as Parameters<typeof submitOrder>[0]);
            setIsSubmitting(false);
            if (result.success) {
                navigate('/ordre-bekreftelse?status=success');
            } else {
                toast({ title: 'Noe gikk galt', description: 'Prøv igjen litt senere.', variant: 'destructive' });
            }
        }
    };

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="font-serif text-3xl font-bold text-foreground">Produkt ikke funnet</h1>
                <Button onClick={() => navigate(-1)} variant="outline" className="mt-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Tilbake
                </Button>
            </div>
        );
    }

    const isCake = isCakeCategory(category || '');

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container mx-auto px-4 pt-6 max-w-5xl">
                {/* Tilbake */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Tilbake
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                    {/* ── Venstre: Produktbilde ── */}
                    <div className="sticky top-4 self-start">
                        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center shadow-soft">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                                    <ImageIcon className="w-16 h-16" />
                                    <span className="text-sm">Bilde kommer snart</span>
                                </div>
                            )}
                        </div>

                        {/* Fargevalgt forhåndsvisning */}
                        <div className="mt-4 p-4 bg-muted/40 rounded-xl text-sm text-muted-foreground text-center">
                            Farge: <span className="font-medium text-foreground flex items-center gap-1.5 justify-center mt-1">
                                <span className="w-4 h-4 rounded-full border border-border/50 inline-block" style={{ backgroundColor: selectedColor.hex }} />
                                {selectedColor.label}
                            </span>
                        </div>
                    </div>

                    {/* ── Høyre: Tilpasning ── */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-foreground">{product.name}</h1>
                            <p className="text-muted-foreground mt-1">{product.description}</p>
                            <p className="text-2xl font-bold text-foreground mt-3">
                                fra {(isCake ? selectedSize.price : product.price).toLocaleString('nb-NO')} kr
                            </p>
                        </div>

                        {/* ── Størrelse (kun kaker) ── */}
                        {isCake && (
                            <div>
                                <Label className="text-base font-semibold mb-3 block">Størrelse</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CAKE_SIZES.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                "p-3.5 rounded-xl border-2 text-left transition-all duration-200",
                                                selectedSize.id === size.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/40"
                                            )}
                                        >
                                            <p className="font-semibold text-sm text-foreground">{size.label}</p>
                                            <p className="text-xs text-muted-foreground">{size.persons}</p>
                                            <p className="text-sm font-bold text-primary mt-1">{size.price.toLocaleString('nb-NO')} kr</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Antall (ikke kaker) ── */}
                        {!isCake && (
                            <div>
                                <Label className="text-base font-semibold mb-3 block">
                                    Antall {product.minOrder ? `(min. ${product.minOrder} stk)` : ''}
                                </Label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(product.minOrder || 1, q - 1))}
                                        className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors font-bold"
                                    >−</button>
                                    <span className="text-lg font-semibold w-10 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors font-bold"
                                    >+</button>
                                    <span className="text-sm text-muted-foreground ml-2">= {(product.price * quantity).toLocaleString('nb-NO')} kr</span>
                                </div>
                            </div>
                        )}

                        {/* ── Smak ── */}
                        <div>
                            <Label className="text-base font-semibold mb-3 block">Smak</Label>
                            <div className="flex flex-wrap gap-2">
                                {CAKE_FLAVORS.map((flavor) => (
                                    <button
                                        key={flavor.id}
                                        onClick={() => setSelectedFlavor(flavor)}
                                        className={cn(
                                            "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                                            selectedFlavor.id === flavor.id
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border text-foreground hover:border-primary/40"
                                        )}
                                    >{flavor.label}</button>
                                ))}
                            </div>
                        </div>

                        {/* ── Farge ── */}
                        <div>
                            <Label className="text-base font-semibold mb-3 block">Farge</Label>
                            <div className="flex flex-wrap gap-2.5">
                                {CAKE_COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color)}
                                        title={color.label}
                                        aria-label={color.label}
                                        className={cn(
                                            "w-9 h-9 rounded-full border-2 transition-all duration-200",
                                            selectedColor.id === color.id
                                                ? "border-primary scale-110 shadow-md"
                                                : "border-transparent hover:border-primary/50 hover:scale-105"
                                        )}
                                        style={{ backgroundColor: color.hex, outline: '2px solid hsl(var(--border))' }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Valgt: {selectedColor.label}</p>
                        </div>

                        {/* ── Spiselig bilde ── */}
                        <div>
                            <button
                                onClick={() => setWithPhoto((v) => !v)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                    withPhoto ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                                )}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-sm text-foreground">Legg til spiselig bilde</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Eget bilde trykket på kaken</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-primary text-sm">+{PHOTO_ADDON_PRICE} kr</span>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        withPhoto ? "bg-primary border-primary" : "border-border"
                                    )}>
                                        {withPhoto && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* ── Tekst på kaken ── */}
                        <div>
                            <Label htmlFor="cakeText" className="text-base font-semibold mb-2 block">
                                Tekst på kaken <span className="font-normal text-sm text-muted-foreground">(valgfritt)</span>
                            </Label>
                            <Input
                                id="cakeText"
                                placeholder='F.eks. "Gratulerer med dagen!"'
                                value={cakeText}
                                onChange={(e) => setCakeText(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        {/* ── Leveringsdato ── */}
                        <div>
                            <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> Leveringsdato *
                            </Label>
                            {calLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                                        <button
                                            onClick={() => setCurrentMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })}
                                            disabled={!canGoPrev}
                                            aria-label="Forrige måned"
                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="font-serif font-semibold text-sm">
                                            {MONTHS_NB[currentMonth.month]} {currentMonth.year}
                                        </span>
                                        <button
                                            onClick={() => setCurrentMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })}
                                            disabled={!canGoNext}
                                            aria-label="Neste måned"
                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 px-2 py-1">
                                        {WEEKDAYS.map((d) => (
                                            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
                                        {calendarDays.map((day, i) => {
                                            if (!day) return <div key={`e-${i}`} />;
                                            const status = getDayStatus(day.dateStr, day.date);
                                            const isSel = deliveryDate === day.dateStr;
                                            const isAvail = status === 'available';
                                            const isFull = status === 'full' || status === 'blocked';
                                            return (
                                                <button
                                                    key={day.dateStr}
                                                    onClick={() => isAvail && setDeliveryDate(day.dateStr)}
                                                    disabled={!isAvail}
                                                    className={cn(
                                                        "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                                                        isSel && "bg-primary text-primary-foreground shadow-sm",
                                                        !isSel && isAvail && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer",
                                                        isFull && "bg-red-50 text-red-400 cursor-not-allowed",
                                                        status === 'past' && "text-muted-foreground/30 cursor-not-allowed",
                                                    )}
                                                >{day.date.getDate()}</button>
                                            );
                                        })}
                                    </div>
                                    <div className="px-3 py-2 border-t border-border/50 bg-muted/20 flex gap-4 justify-center text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Ledig</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Opptatt</span>
                                    </div>
                                </div>
                            )}
                            {deliveryDate && (
                                <p className="text-sm text-primary font-medium mt-2">
                                    ✓ Valgt: {formatNorwegianDate(deliveryDate)}
                                </p>
                            )}
                        </div>

                        {/* ── Inspirasjonsbilder ── */}
                        <div>
                            <Label className="text-base font-semibold mb-2 block">
                                Inspirasjonsbilder <span className="font-normal text-sm text-muted-foreground">(valgfritt)</span>
                            </Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                            >
                                <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                                <p className="text-sm text-muted-foreground">Klikk for å laste opp</p>
                                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Last opp bilder" />
                            </div>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {images.map((file, i) => (
                                        <div key={i} className="relative group">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-14 h-14 object-cover rounded-lg border border-border" />
                                            <button
                                                aria-label="Fjern bilde"
                                                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Ønsker ── */}
                        <div>
                            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                                Ønsker / beskrivelse <span className="font-normal text-sm text-muted-foreground">(valgfritt)</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Beskriv ønskene dine her..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>

                        {/* ── Kontaktinfo ── */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold block">Kontaktinfo *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Navn" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 rounded-xl" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl" />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input type="tel" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 rounded-xl" />
                            </div>
                        </div>

                        {/* ── Pris + Bestill ── */}
                        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft">
                            <div className="space-y-1.5 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{product.name}</span>
                                    <span className="font-medium">{basePrice.toLocaleString('nb-NO')} kr</span>
                                </div>
                                {isCake && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Størrelse</span>
                                        <span className="font-medium">{selectedSize.persons}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Smak</span>
                                    <span className="font-medium">{selectedFlavor.label}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Farge</span>
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <span className="w-3 h-3 rounded-full border border-border/50 inline-block" style={{ backgroundColor: selectedColor.hex }} />
                                        {selectedColor.label}
                                    </span>
                                </div>
                                {withPhoto && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Spiselig bilde</span>
                                        <span className="font-medium">+{PHOTO_ADDON_PRICE} kr</span>
                                    </div>
                                )}
                                {deliveryDate && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Levering</span>
                                        <span className="font-medium">{formatNorwegianDate(deliveryDate)}</span>
                                    </div>
                                )}
                                <div className="border-t border-border/50 pt-3 mt-2 flex justify-between text-base">
                                    <span className="font-bold text-foreground">Totalt</span>
                                    <span className="font-bold text-primary">{totalPrice.toLocaleString('nb-NO')} kr</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleOrder}
                                disabled={!isValid || isSubmitting}
                                size="lg"
                                className="w-full rounded-full gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Behandler...</>
                                ) : (
                                    <><ShoppingBag className="w-4 h-4" /> Bestill — {totalPrice.toLocaleString('nb-NO')} kr</>
                                )}
                            </Button>

                            {!isValid && (
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Fyll inn dato og kontaktinfo for å bestille
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
