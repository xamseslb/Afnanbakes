import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Heart, Moon, Baby, Check, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OccasionTab = 'bursdag' | 'bryllup' | 'ramadan' | 'babyshower';

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
    packages: PackageItem[];
}

const occasions: OccasionData[] = [
    {
        id: 'bursdag',
        label: 'Bursdag',
        icon: <Cake className="w-5 h-5" />,
        description: 'Feir bursdagen med hjemmebakte favoritter',
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
        id: 'ramadan',
        label: 'Ramadan',
        icon: <Moon className="w-5 h-5" />,
        description: 'Autentisk somalisk bakst for Ramadan',
        packages: [
            {
                name: 'Ramadan Familie',
                price: 599,
                items: [
                    '20 sambosa',
                    '10 sabayad',
                    'Hjemmelaget med kjærlighet',
                ],
            },
            {
                name: 'Ramadan Feiring',
                price: 1299,
                popular: true,
                items: [
                    '40 sambosa',
                    '20 sabayad',
                    '1 kake (10 personer)',
                    'Perfekt for iftar',
                ],
            },
            {
                name: 'Ramadan Storfeiring',
                price: 2199,
                items: [
                    '60 sambosa',
                    '30 sabayad',
                    '1 kake',
                    '24 cupcakes',
                    'Ideell for store samlinger',
                ],
            },
        ],
    },
    {
        id: 'babyshower',
        label: 'Baby Shower',
        icon: <Baby className="w-5 h-5" />,
        description: 'Velkommen den lille med noe søtt',
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
            <section className="border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-20">
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

            {/* Packages */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Occasion description */}
                            <p className="text-center text-muted-foreground mb-12 text-lg">
                                {activeOccasion.description}
                            </p>

                            {/* Cards grid */}
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
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        className={cn(
                                            'relative rounded-2xl bg-card p-6 md:p-8 shadow-soft transition-all duration-300 hover:shadow-elevated flex flex-col',
                                            pkg.popular
                                                ? 'border-2 border-primary ring-1 ring-primary/20 md:scale-105'
                                                : 'border border-border/50'
                                        )}
                                    >
                                        {/* Popular badge */}
                                        {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-card">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Mest populær
                                                </span>
                                            </div>
                                        )}

                                        {/* Package name */}
                                        <h3 className="font-serif text-xl font-bold text-card-foreground mt-2">
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

                                        {/* Items list */}
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {pkg.items.map((item) => (
                                                <li key={item} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-card-foreground">{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <Link to={`/?anledning=${activeTab}&pakke=${encodeURIComponent(pkg.name)}`}>
                                            <Button
                                                className={cn(
                                                    'w-full gap-2 rounded-full',
                                                    pkg.popular
                                                        ? 'shadow-card'
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

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
