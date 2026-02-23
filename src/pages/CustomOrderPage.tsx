/**
 * CustomOrderPage — Egendefinert bestillingsside.
 * Kunden sender inn inspirasjonsbilder og ønsker
 * (antall porsjoner, smak/fyll, farge, toppere).
 * Prisen avtales manuelt etter at bestillingen er mottatt.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, ChevronRight, User, Mail, Phone,
    Loader2, Send, ImagePlus, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { generateOrderRef } from '@/lib/orderService';
import { sendConfirmationEmail } from '@/lib/emailService';

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
    const [portions, setPortions] = useState('');
    const [flavor, setFlavor] = useState('');
    const [color, setColor] = useState('');
    const [topperName, setTopperName] = useState('');
    const [topperTheme, setTopperTheme] = useState('');
    const [notes, setNotes] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── Validering ── */
    const isValid = !!deliveryDate && !!name && !!email && !!phone;

    /* ── Bildevalg ── */
    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const next = [...images, ...Array.from(files)].slice(0, 4);
        setImages(next);
    };

    /* ── Innsending ── */
    async function handleSubmit() {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            const imageUrls = await uploadImages(images);
            const orderRef = generateOrderRef();

            const description = [
                portions ? `Antall porsjoner: ${portions}` : '',
                flavor ? `Smak og fyll: ${flavor}` : '',
                color ? `Farge: ${color}` : '',
                topperName ? `Topper navn: ${topperName}` : '',
                topperTheme ? `Topper tema: ${topperTheme}` : '',
                notes ? `Tilleggsinfo: ${notes}` : '',
            ].filter(Boolean).join(' | ');

            const record = {
                order_ref: orderRef,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                occasion: 'Eget design',
                product_type: 'Custom',
                package_name: 'Custom bestilling',
                package_price: null,
                is_custom_design: true,
                description,
                ideas: '',
                cake_name: topperName,
                cake_text: '',
                quantity: portions,
                image_urls: imageUrls,
                delivery_date: deliveryDate,
                status: 'pending',
            };

            const { error } = await supabase.from('orders').insert([record]);
            if (error) throw new Error(error.message);

            // Send bekreftelsesmail (ikke-blokkerende)
            sendConfirmationEmail(
                {
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                    occasion: null,
                    productType: null,
                    selectedSize: null,
                    selectedPackage: null,
                    selectedFlavor: null,
                    selectedColor: null,
                    withPhoto: false,
                    isCustomDesign: true,
                    description,
                    ideas: '',
                    cakeName: topperName,
                    cakeText: '',
                    quantity: portions,
                    images: [],
                    deliveryDate,
                },
                orderRef
            ).catch((err) => console.error('E-post feilet:', err));

            navigate('/ordre-bekreftelse', { state: { orderRef } });
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Tilpasset for deg
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Custom bestilling
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                        Fortell oss hva du drømmer om — last opp inspirasjon og fyll inn ønskene dine.
                        Vi tar kontakt for å bekrefte detaljer og pris.
                    </p>
                </motion.div>
            </div>

            {/* ── Skjema ── */}
            <div className="max-w-2xl mx-auto px-4 pb-24 space-y-8">

                {/* Bildeupload */}
                <Section title="Inspirasjonsbilder" subtitle="Last opp bilder som viser stil, farger eller design du liker (maks 4)">
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    >
                        <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Klikk eller dra bilder hit</p>
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
                        <div className="flex flex-wrap gap-3 mt-3">
                            {images.map((file, i) => (
                                <div key={i} className="relative group w-20 h-20">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Bilde ${i + 1}`}
                                        className="w-full h-full object-cover rounded-lg border border-border"
                                    />
                                    <button
                                        type="button"
                                        title="Fjern bilde"
                                        onClick={() => setImages(images.filter((_, j) => j !== i))}
                                        className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Antall porsjoner */}
                <Section title="Antall porsjoner" subtitle="Hvor mange skal kaken rekke til?">
                    <Input
                        placeholder="F.eks. 20 porsjoner"
                        value={portions}
                        onChange={(e) => setPortions(e.target.value)}
                    />
                </Section>

                {/* Smak og fyll */}
                <Section title="Smak og fyll" subtitle="Hvilken smak ønsker du på bunn og fyll?">
                    <Textarea
                        placeholder="F.eks. Vanilje bunn med jordbær og fløtekrem"
                        rows={2}
                        value={flavor}
                        onChange={(e) => setFlavor(e.target.value)}
                    />
                </Section>

                {/* Farge */}
                <Section title="Farge" subtitle="Beskriv fargevalg eller fargeskjema">
                    <Input
                        placeholder="F.eks. Rosa og hvit, eller pastell"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                </Section>

                {/* Toppere */}
                <Section title="Toppere" subtitle="Vil du ha toppere? Skriv navn og tema">
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Navn på topper</Label>
                            <Input
                                placeholder="F.eks. Sofia"
                                value={topperName}
                                onChange={(e) => setTopperName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Tema / stil</Label>
                            <Input
                                placeholder="F.eks. Prinsesse, fotball, blomster"
                                value={topperTheme}
                                onChange={(e) => setTopperTheme(e.target.value)}
                            />
                        </div>
                    </div>
                </Section>

                {/* Tilleggsinfo */}
                <Section title="Annet du vil fortelle oss" subtitle="Allergier, spesielle ønsker, eller andre detaljer">
                    <Textarea
                        placeholder="Skriv gjerne alt du tenker på..."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Section>

                {/* Hentetidspunkt */}
                <Section title="Ønsket hentedato">
                    <input
                        type="date"
                        title="Velg hentedato"
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={deliveryDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                </Section>

                {/* Kontaktinfo */}
                <Section title="Kontaktinformasjon">
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Fullt navn *"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                type="email"
                                placeholder="E-postadresse *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                type="tel"
                                placeholder="Telefonnummer *"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </Section>

                {/* Send */}
                <div className="pt-2">
                    <Button
                        size="lg"
                        className="w-full rounded-full gap-2"
                        disabled={!isValid || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sender...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Send forespørsel</>
                        )}
                    </Button>
                    {!isValid && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Fyll inn hentedato, navn, e-post og telefon for å sende
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-3">
                        Vi bekrefter bestillingen og avtaler pris via e-post innen kort tid.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── Hjelpkomponent: seksjon med tittel og undertittel ── */
function Section({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            <div className="border-b border-border/40 pb-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    );
}
