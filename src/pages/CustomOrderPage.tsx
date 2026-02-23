/**
 * CustomOrderPage — Egendefinert bestillingsside.
 * Kunden laster opp inspirasjon, beskriver ønsket, velger dato og legger igjen kontaktinfo.
 * Bruker samme kalender med tilgjengelighetssjekk som resten av siden.
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ImagePlus, X, User, Mail, Phone,
    Loader2, Send, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { generateOrderRef } from '@/lib/orderService';
import { sendConfirmationEmail } from '@/lib/emailService';
import { fetchAvailability, type DateAvailability } from '@/lib/calendarService';

/* ── Hjelpefunksjoner (identiske med ProductDetailPage) ── */
const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS_NB = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function toDateStr(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/* ── Bildeopplasting til Supabase Storage ── */
async function uploadImages(images: File[]): Promise<string[]> {
    if (images.length === 0) return [];
    const urls: string[] = [];
    for (const file of images) {
        const ext = file.name.split('.').pop();
        const path = `order-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('orders').upload(path, file);
        if (error) { console.error('Bildeopplasting feilet:', error.message); continue; }
        const { data } = supabase.storage.from('orders').getPublicUrl(path);
        urls.push(data.publicUrl);
    }
    return urls;
}

export default function CustomOrderPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Skjemafelt ── */
    const [images, setImages] = useState<File[]>([]);
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── Kalender ── */
    const [availability, setAvailability] = useState<DateAvailability[]>([]);
    const [calLoading, setCalLoading] = useState(true);
    const [deliveryDate, setDeliveryDate] = useState('');
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
        const max = new Date(today); max.setDate(max.getDate() + 90);
        return new Date(currentMonth.year, currentMonth.month + 1, 1) <= max;
    }, [currentMonth, today]);

    function getDayStatus(dateStr: string, date: Date) {
        if (date <= today) return 'past';
        const max = new Date(today); max.setDate(max.getDate() + 90);
        if (date > max) return 'past';
        const a = availabilityMap[dateStr];
        if (!a) return 'available';
        return a.status;
    }

    /* ── Bilder ── */
    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        setImages((prev) => [...prev, ...Array.from(files)].slice(0, 6));
    };

    const isValid = !!deliveryDate && !!name && !!email && !!phone;

    /* ── Innsending ── */
    async function handleSubmit() {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            const imageUrls = await uploadImages(images);
            const orderRef = generateOrderRef();

            const record = {
                order_ref: orderRef,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                occasion: 'Custom',
                product_type: 'Custom',
                package_name: 'Custom bestilling',
                package_price: null,
                is_custom_design: true,
                description,
                ideas: '',
                cake_name: '',
                cake_text: '',
                quantity: '',
                image_urls: imageUrls,
                delivery_date: deliveryDate || null,
                status: 'pending',
            };

            const { error } = await supabase.from('orders').insert([record]);
            if (error) throw new Error(error.message);

            sendConfirmationEmail(
                {
                    customerName: name, customerEmail: email, customerPhone: phone,
                    occasion: null, productType: null, selectedSize: null,
                    selectedPackage: null, selectedFlavor: null, selectedColor: null,
                    withPhoto: false, isCustomDesign: true, description,
                    ideas: '', cakeName: '', cakeText: '', quantity: '',
                    images: [], deliveryDate,
                },
                orderRef
            ).catch((err) => console.error('E-post feilet:', err));

            /* ── Naviger til bekreftelsessiden med URL-parametere ── */
            navigate(`/ordre-bekreftelse?ref=${orderRef}&status=success&type=custom`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Ukjent feil';
            toast({ title: 'Noe gikk galt', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">

            {/* ── Hero ── */}
            <div className="bg-gradient-to-b from-primary/5 to-background pt-16 pb-10 px-4 text-center">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Custom bestilling
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                        Vi lager kaker til <strong>bryllup, bursdager, babyshower, konfirmasjon</strong> og alle
                        anledninger. Last opp bilder som inspirasjon, beskriv hva du ønsker — og vi tar kontakt med deg.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-xl mx-auto px-4 pb-24 space-y-8">

                {/* ── Bildeupload ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div
                        className="border-2 border-dashed border-border hover:border-primary/60 transition-colors rounded-2xl p-10 text-center cursor-pointer bg-secondary/20"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    >
                        <ImagePlus className="w-10 h-10 mx-auto text-primary/50 mb-3" />
                        <p className="font-medium text-foreground text-sm">Last opp inspirasjonsbilder</p>
                        <p className="text-xs text-muted-foreground mt-1">Klikk eller dra bilder hit — opptil 6 stk</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            title="Last opp bilder"
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {images.map((file, i) => (
                                <div key={i} className="relative group aspect-square">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Bilde ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border border-border"
                                    />
                                    <button
                                        type="button"
                                        title="Fjern bilde"
                                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ── Beskrivelse ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Beskriv hva du ønsker
                    </label>
                    <Textarea
                        rows={6}
                        placeholder="Fortell oss alt — antall porsjoner, smak og fyll, farge, tekst på kaken, toppere, anledning, allergier eller andre ønsker..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="resize-none"
                    />
                </motion.div>

                {/* ── Kalender ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                    <p className="text-sm font-semibold text-foreground mb-3">Ønsket hentedato</p>

                    {calLoading ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Laster kalender...
                        </div>
                    ) : (
                        <div className="border border-border rounded-2xl p-4 bg-card">
                            {/* Navigasjon */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    title="Forrige måned"
                                    onClick={() => setCurrentMonth((m) => {
                                        const d = new Date(m.year, m.month - 1);
                                        return { year: d.getFullYear(), month: d.getMonth() };
                                    })}
                                    disabled={!canGoPrev}
                                    className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-semibold">
                                    {MONTHS_NB[currentMonth.month]} {currentMonth.year}
                                </span>
                                <button
                                    type="button"
                                    title="Neste måned"
                                    onClick={() => setCurrentMonth((m) => {
                                        const d = new Date(m.year, m.month + 1);
                                        return { year: d.getFullYear(), month: d.getMonth() };
                                    })}
                                    disabled={!canGoNext}
                                    className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Ukedager */}
                            <div className="grid grid-cols-7 mb-2">
                                {WEEKDAYS.map((d) => (
                                    <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
                                ))}
                            </div>

                            {/* Dager */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, i) => {
                                    if (!day) return <div key={`e-${i}`} />;
                                    const status = getDayStatus(day.dateStr, day.date);
                                    const isSelected = deliveryDate === day.dateStr;
                                    const isBlocked = status === 'blocked' || status === 'past';
                                    return (
                                        <button
                                            key={day.dateStr}
                                            type="button"
                                            disabled={isBlocked}
                                            onClick={() => !isBlocked && setDeliveryDate(day.dateStr)}
                                            className={[
                                                'aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : isBlocked
                                                        ? 'text-muted-foreground/30 cursor-not-allowed line-through'
                                                        : 'hover:bg-primary/10 text-foreground cursor-pointer',
                                            ].join(' ')}
                                        >
                                            {day.date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Valgt
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-muted inline-block" /> Ikke tilgjengelig
                                </span>
                            </div>
                        </div>
                    )}

                    {deliveryDate && (
                        <p className="text-xs text-primary mt-2 font-medium">
                            ✓ Valgt dato: {new Date(deliveryDate + 'T12:00:00').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    )}
                </motion.div>

                {/* ── Kontaktinfo ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                    <p className="text-sm font-semibold text-foreground mb-3">Kontaktinformasjon</p>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Fullt navn *" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" type="email" placeholder="E-postadresse *" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" type="tel" placeholder="Telefonnummer *" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Send ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                    <Button
                        size="lg"
                        className="w-full rounded-full gap-2"
                        disabled={!isValid || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sender...</>
                            : <><Send className="w-4 h-4" /> Send forespørsel</>
                        }
                    </Button>
                    {!isValid && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Velg en dato og fyll inn navn, e-post og telefon for å sende
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-3">
                        Vi tar kontakt med deg innen kort tid for å bekrefte detaljer og pris. 🎂
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
