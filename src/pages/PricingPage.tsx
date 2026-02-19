import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Heart, Moon, Baby, Check, ArrowRight, Sparkles, Star, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OccasionTab = 'bursdag' | 'bryllup' | 'babyshower';

interface PackageItem {
    name: string;
    price: number;
    popular?: boolean;
    items: string[];
}

interface OccasionData {
    id: OccasionTab;
    label: string;
    icon: React.ReactNode;
    description: string;
    image: string;
    packages: PackageItem[];
}

const occasions: OccasionData[] = [
    {
        id: 'bursdag',
        label: 'Bursdag',
        icon: <Cake className="w-5 h-5" />,
        description: 'Feir bursdagen med hjemmebakte favoritter',
        image: '/images/hero/Gemini_Generated_Image_9rjfcm9rjfcm9rjf.jpg',
        packages: [
            {
                name: 'Liten Bursdag',
                price: 699,
                items: [
                    '1 kake (8–10 personer)',
                    'Valgfritt design',
                    'Tekst på kaken',
                ],
            },
            {
                name: 'Bursdag Klassisk',
                price: 1199,
                popular: true,
                items: [
                    '1 kake (10–15 personer)',
                    '12 cupcakes',
                    'Valgfritt design & tema',
                    'Tekst på kaken',
                ],
            },
            {
                name: 'Bursdag Deluxe',
                price: 1899,
                items: [
                    '1 kake (15–20 personer)',
                    '24 cupcakes',
                    '20 cookies',
                    'Tilpasset design & tema',
                    'Tekst på kaken',
                ],
            },
        ],
    },
    {
        id: 'bryllup',
        label: 'Bryllup',
        icon: <Heart className="w-5 h-5" />,
        description: 'Gjør den store dagen ekstra spesiell',
        image: '/images/hero/Gemini_Generated_Image_v34wm2v34wm2v34w.jpg',
        packages: [
            {
                name: 'Bryllup Elegant',
                price: 1999,
                items: [
                    '1 bryllupskake (20–30 personer)',
                    'Elegant design',
                    'Personlig konsultasjon',
                ],
            },
            {
                name: 'Bryllup Premium',
                price: 3499,
                popular: true,
                items: [
                    '1 bryllupskake (30–50 personer)',
                    '30 cupcakes',
                    'Premium design & dekor',
                    'Personlig konsultasjon',
                ],
            },
            {
                name: 'Bryllup Grand',
                price: 5499,
                items: [
                    '1 bryllupskake (50+ personer)',
                    '48 cupcakes',
                    '40 cookies',
                    'Luksus design & dekor',
                    'Personlig konsultasjon',
                    'Prøvesmaking inkludert',
                ],
            },
        ],
    },

    {
        id: 'babyshower',
        label: 'Baby Shower',
        icon: <Baby className="w-5 h-5" />,
        description: 'Velkommen den lille med noe søtt',
        image: '/images/hero/Gemini_Generated_Image_3xupkg3xupkg3xup.png',
        packages: [
            {
                name: 'Baby Shower Sweet',
                price: 1099,
                items: [
                    '1 kake (10 personer)',
                    '12 cupcakes i tema',
                    'Valgfritt design',
                    'Tekst på kaken',
                ],
            },
            {
                name: 'Baby Shower Komplett',
                price: 1799,
                popular: true,
                items: [
                    '1 kake (15–20 personer)',
                    '24 cupcakes i tema',
                    '20 cookies',
                    'Tilpasset design & tema',
                    'Tekst på kaken',
                ],
            },
        ],
    },
];

const faqItems = [
    {
        q: 'Hvor lang tid i forveien må jeg bestille?',
        a: 'Kaker bør bestilles minst 3–5 dager i forveien. Bryllupskaker og store bestillinger bør bestilles 1–2 uker i forveien. Cupcakes og cookies kan noen ganger lages med kortere frist — ta kontakt!',
    },
    {
        q: 'Leverer dere i Oslo?',
        a: 'Vi holder til i Oslo og tilbyr henting. Levering kan avtales for større bestillinger. Kontakt oss for å avtale detaljer.',
    },
    {
        q: 'Kan dere lage glutenfritt eller allergitilpasset?',
        a: 'Ja! Oppgi eventuelle allergier i bestillingsskjemaet, så tilpasser vi så godt vi kan. Merk at produktene våre kan inneholde spor av nøtter, egg, melk og gluten.',
    },
    {
        q: 'Kan jeg designe min egen kake?',
        a: 'Absolutt! Velg "Lag eget design" i bestillingen og beskriv ønskene dine. Du kan laste opp inspirasjonsbilder, og vi kontakter deg for å planlegge designet.',
    },
    {
        q: 'Hvordan betaler jeg?',
        a: 'Vi aksepterer Vipps og kontant betaling ved henting. Betaling avtales når vi bekrefter bestillingen din.',
    },
    {
        q: 'Kan jeg kansellere en bestilling?',
        a: 'Ja, bestillinger kan kanselleres inntil 48 timer før avtalt utlevering. Bruk kanselleringssiden med din ordrereferanse og e-post.',
    },
];

function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                        <HelpCircle className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Ofte stilte spørsmål
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Finn svar på de vanligste spørsmålene
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqItems.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card rounded-xl border border-border/50 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
                            >
                                <span className="font-medium text-foreground pr-4">{item.q}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="px-5 pb-5 text-muted-foreground leading-relaxed">
                                            {item.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState<OccasionTab>('bursdag');
    const activeOccasion = occasions.find((o) => o.id === activeTab)!;

    return (
        <>
            {/* Hero */}
            <section className="bg-gradient-hero py-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-primary" />
                            <span className="text-sm font-medium text-primary uppercase tracking-widest">
                                Pakkepriser
                            </span>
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                            Våre Pakker
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Velg den perfekte pakken for din anledning. Alle priser er veiledende
                            og kan tilpasses dine ønsker.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Tabs */}
            <section className="border-b border-border relative bg-background z-20">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 justify-center py-3 overflow-x-auto">
                        {occasions.map((occasion) => (
                            <button
                                key={occasion.id}
                                onClick={() => setActiveTab(occasion.id)}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
                                    activeTab === occasion.id
                                        ? 'bg-primary text-primary-foreground shadow-card'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                            >
                                {occasion.icon}
                                {occasion.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages — immersive full-bleed with glassmorphism cards */}
            <AnimatePresence mode="wait">
                <motion.section
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden"
                >
                    {/* Full-bleed background image */}
                    <div className="absolute inset-0">
                        <img
                            src={activeOccasion.image}
                            alt={activeOccasion.label}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-foreground/25" />
                    </div>

                    {/* Content over background */}
                    <div className="relative z-10 py-16 md:py-24">
                        <div className="container mx-auto px-4">
                            {/* Occasion title */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.5 }}
                                className="text-center mb-12"
                            >
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
                                    {activeOccasion.label}
                                </h2>
                                <p className="text-white/80 text-lg max-w-lg mx-auto">
                                    {activeOccasion.description}
                                </p>
                            </motion.div>

                            {/* Glassmorphism cards */}
                            <div
                                className={cn(
                                    'grid gap-6 max-w-5xl mx-auto',
                                    activeOccasion.packages.length === 2
                                        ? 'grid-cols-1 md:grid-cols-2 max-w-3xl'
                                        : 'grid-cols-1 md:grid-cols-3'
                                )}
                            >
                                {activeOccasion.packages.map((pkg, index) => (
                                    <motion.div
                                        key={pkg.name}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.12, duration: 0.5 }}
                                        whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                        className={cn(
                                            'relative rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300',
                                            'bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-2xl',
                                            pkg.popular
                                                ? 'border-2 border-primary ring-2 ring-primary/30 md:scale-105'
                                                : 'border border-white/30'
                                        )}
                                    >
                                        {/* Popular badge */}
                                        {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Mest populær
                                                </span>
                                            </div>
                                        )}

                                        {/* Package name */}
                                        <h3 className="font-serif text-xl font-bold text-foreground mt-2">
                                            {pkg.name}
                                        </h3>

                                        {/* Price */}
                                        <div className="mt-4 mb-6">
                                            <span className="text-sm text-muted-foreground">fra </span>
                                            <span className="text-4xl font-bold text-foreground">
                                                {pkg.price.toLocaleString('nb-NO')}
                                            </span>
                                            <span className="text-lg text-muted-foreground"> kr</span>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-12 h-0.5 bg-primary/40 rounded mb-6" />

                                        {/* Items list */}
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {pkg.items.map((item) => (
                                                <li key={item} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-foreground">{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <Link to={`/?anledning=${activeTab}&pakke=${encodeURIComponent(pkg.name)}`}>
                                            <Button
                                                className={cn(
                                                    'w-full gap-2 rounded-full',
                                                    pkg.popular
                                                        ? 'shadow-lg'
                                                        : ''
                                                )}
                                                variant={pkg.popular ? 'default' : 'outline'}
                                                size="lg"
                                            >
                                                Bestill nå
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </AnimatePresence>

            {/* FAQ Section */}
            <FaqSection />

            {/* Custom CTA */}
            <section className="py-16 bg-secondary/30">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                            Ønsker noe skreddersydd?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                            Ingen bestilling er for stor eller liten. Kontakt oss for et
                            tilpasset tilbud som passer akkurat dine behov.
                        </p>
                        <Link to="/">
                            <Button size="lg" className="gap-2 rounded-full shadow-elevated">
                                Start bestilling
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
