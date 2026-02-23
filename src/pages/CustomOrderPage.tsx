/**
 * CustomOrderPage — Egendefinert bestillingsside.
 * Kunden laster opp bilder, beskriver ønsket, og legger igjen kontaktinfo.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImagePlus, X, User, Mail, Phone, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

    const [images, setImages] = useState<File[]>([]);
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = !!name && !!email && !!phone;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        setImages((prev) => [...prev, ...Array.from(files)].slice(0, 6));
    };

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
                delivery_date: '',
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
                    images: [], deliveryDate: '',
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

            {/* ── Hero-tekst ── */}
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
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Dropzone */}
                    <div
                        className="border-2 border-dashed border-border hover:border-primary/60 transition-colors rounded-2xl p-10 text-center cursor-pointer bg-secondary/20"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    >
                        <ImagePlus className="w-10 h-10 mx-auto text-primary/50 mb-3" />
                        <p className="font-medium text-foreground text-sm">Last opp inspirasjonsbilder</p>
                        <p className="text-xs text-muted-foreground mt-1">Klikk eller dra bilder hit &mdash; opptil 6 stk</p>
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

                    {/* Forhåndsvisning */}
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
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
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

                {/* ── Kontaktinfo ── */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
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
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
                            Fyll inn navn, e-post og telefon for å sende
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
