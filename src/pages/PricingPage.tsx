/**
 * PricingPage — Prisoversikt med størrelser, smaker, farger og tillegg.
 * Viser alle kake-størrelser med priser og lar kunden navigere direkte til bestilling.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Cake, Heart, Baby, Sparkles, Check, ArrowRight,
    Ruler, Droplets, Palette, Camera, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    CAKE_SIZES, CAKE_FLAVORS, CAKE_COLORS, PHOTO_ADDON_PRICE,
    Occasion, occasionLabels,
} from '@/lib/orderTypes';

const occasions: { id: Occasion; icon: React.ReactNode; description: string }[] = [
    { id: 'bursdag', icon: <Cake className="w-5 h-5" />, description: 'Feir bursdagen med en spesiallaget kake' },
    { id: 'bryllup', icon: <Heart className="w-5 h-5" />, description: 'Gjør den store dagen ekstra spesiell' },
    { id: 'babyshower', icon: <Baby className="w-5 h-5" />, description: 'Velkommen lille en med stil' },
    { id: 'annet', icon: <Sparkles className="w-5 h-5" />, description: 'Noe å feire? Vi baker for deg' },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="pt-12 pb-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4"
                >
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Priser
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Velg størrelse, smak og farge — vi baker kaken din med kjærlighet
                    </p>
                </motion.div>
            </section>

            <div className="container mx-auto px-4 pb-20 space-y-16">

                {/* ── Størrelser & Priser ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Ruler className="w-6 h-6 text-primary" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Størrelser</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CAKE_SIZES.map((size, i) => (
                            <motion.div
                                key={size.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative bg-card rounded-2xl border border-border/50 p-6 text-center",
                                    "hover:shadow-card hover:border-primary/30 transition-all duration-300",
                                    i === 1 && "ring-2 ring-primary/20"
                                )}
                            >
                                {i === 1 && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                        Populær
                                    </span>
                                )}
                                <h3 className="font-serif text-xl font-bold text-foreground mb-1">{size.label}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{size.persons}</p>
                                <p className="text-3xl font-bold text-primary mb-1">
                                    {size.price.toLocaleString('nb-NO')}
                                    <span className="text-base font-normal text-muted-foreground"> kr</span>
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Smaker ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Droplets className="w-6 h-6 text-primary" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Smaker</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {CAKE_FLAVORS.map((flavor) => (
                            <div
                                key={flavor.id}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-card rounded-xl border border-border/50 text-foreground font-medium"
                            >
                                <Check className="w-4 h-4 text-primary" />
                                {flavor.label}
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Farger ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Palette className="w-6 h-6 text-primary" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Farger</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {CAKE_COLORS.map((color) => (
                            <div
                                key={color.id}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-card rounded-xl border border-border/50 font-medium"
                            >
                                <span
                                    className="w-5 h-5 rounded-full border border-border/50"
                                    style={{ backgroundColor: color.hex }}
                                />
                                {color.label}
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Tillegg ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Camera className="w-6 h-6 text-primary" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Tillegg</h2>
                    </div>
                    <div className="bg-card rounded-2xl border border-border/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-foreground text-lg">Spiselig bilde</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Eget bilde printet på spiselig papir og lagt på kaken
                                </p>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                +{PHOTO_ADDON_PRICE} kr
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* ── Velg anledning for å bestille ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Klar til å bestille?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Velg anledning og start bestillingen
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {occasions.map((occ) => (
                            <Link
                                key={occ.id}
                                to={`/?anledning=${occ.id}`}
                                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-card transition-all duration-300"
                            >
                                <div className="p-3 rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {occ.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{occasionLabels[occ.id]}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{occ.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        ))}
                    </div>
                </motion.section>

                {/* ── FAQ ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        <h2 className="font-serif text-2xl font-bold text-foreground">Vanlige spørsmål</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'Hvor lang tid i forveien bør jeg bestille?',
                                a: 'Vi anbefaler å bestille minst 5 dager i forveien. For bryllupskaker, bestill gjerne 2–3 uker i forveien.',
                            },
                            {
                                q: 'Kan jeg velge annen smak enn de som er listet?',
                                a: 'Absolutt! Kontakt oss, så finner vi en løsning som passer.',
                            },
                            {
                                q: 'Leverer dere?',
                                a: 'Vi tilbyr henting i Oslo. Kontakt oss for å avtale levering.',
                            },
                            {
                                q: 'Hva er spiselig bilde?',
                                a: 'Et ekte bilde printet på spiselig papir med mattrygg blekk. Bildet legges på toppen av kaken.',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-card rounded-xl border border-border/50 p-5"
                            >
                                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                                <p className="text-sm text-muted-foreground">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
