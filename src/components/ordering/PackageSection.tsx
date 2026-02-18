import { motion } from 'framer-motion';
import { Check, Palette, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Occasion, PackageOption } from '@/lib/orderTypes';

interface PackageSectionProps {
    occasion: Occasion | null;
    selectedPackage: PackageOption | null;
    isCustomDesign: boolean;
    onSelectPackage: (pkg: PackageOption) => void;
    onSelectCustom: () => void;
}

interface OccasionPackages {
    packages: PackageOption[];
}

export const occasionPackages: Partial<Record<Occasion, OccasionPackages>> = {
    bursdag: {
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
    bryllup: {
        packages: [
            {
                name: 'Bryllup Elegant',
                price: 1999,
                items: [
                    '1 bryllupskake (20–30 pers)',
                    'Elegant design',
                    'Personlig konsultasjon',
                ],
            },
            {
                name: 'Bryllup Premium',
                price: 3499,
                popular: true,
                items: [
                    '1 bryllupskake (30–50 pers)',
                    '30 cupcakes',
                    'Premium design & dekor',
                    'Personlig konsultasjon',
                ],
            },
            {
                name: 'Bryllup Grand',
                price: 5499,
                items: [
                    '1 bryllupskake (50+ pers)',
                    '48 cupcakes',
                    '40 cookies',
                    'Luksus design & dekor',
                    'Personlig konsultasjon',
                    'Prøvesmaking inkludert',
                ],
            },
        ],
    },
    ramadan: {
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
    babyshower: {
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
};

export function PackageSection({
    occasion,
    selectedPackage,
    isCustomDesign,
    onSelectPackage,
    onSelectCustom,
}: PackageSectionProps) {
    const data = occasion ? occasionPackages[occasion] : null;
    const packages = data?.packages || [];
    const hasPackages = packages.length > 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {hasPackages ? 'Velg en pakke' : 'Beskriv bestillingen'}
                </h2>
                <p className="text-muted-foreground text-lg">
                    {hasPackages
                        ? 'Velg en ferdig pakke, eller lag ditt eget design'
                        : 'Fortell oss hva du ønsker, så gir vi deg et tilbud'}
                </p>
            </motion.div>

            {/* Custom design option — always visible at top */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={onSelectCustom}
                className={cn(
                    'w-full max-w-3xl mx-auto block text-left rounded-2xl p-5 transition-all duration-300 mb-6',
                    'hover:shadow-elevated',
                    isCustomDesign
                        ? 'bg-card border-2 border-primary shadow-elevated ring-1 ring-primary/20'
                        : 'bg-card border border-dashed border-border shadow-soft hover:border-primary/40'
                )}
            >
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                            isCustomDesign
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground'
                        )}
                    >
                        <Palette className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-card-foreground">
                                Lag eget design
                            </h3>
                            {isCustomDesign && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                </motion.div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Har du en unik visjon? Beskriv ønskene dine, så gir vi deg et skreddersydd tilbud.
                        </p>
                    </div>
                    <ArrowRight
                        className={cn(
                            'w-5 h-5 flex-shrink-0 transition-colors',
                            isCustomDesign ? 'text-primary' : 'text-muted-foreground'
                        )}
                    />
                </div>
            </motion.button>

            {/* Divider */}
            {hasPackages && (
                <div className="flex items-center gap-4 max-w-3xl mx-auto mb-8">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground font-medium">
                        eller velg en pakke
                    </span>
                    <div className="flex-1 h-px bg-border" />
                </div>
            )}

            {/* Package cards */}
            {hasPackages && (
                <div
                    className={cn(
                        'grid gap-5',
                        packages.length === 2
                            ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                            : 'grid-cols-1 md:grid-cols-3'
                    )}
                >
                    {packages.map((pkg, index) => {
                        const isSelected = selectedPackage?.name === pkg.name && !isCustomDesign;
                        return (
                            <motion.button
                                key={pkg.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                                onClick={() => onSelectPackage(pkg)}
                                className={cn(
                                    'relative text-left rounded-2xl p-6 transition-all duration-300 flex flex-col',
                                    'hover:shadow-elevated',
                                    isSelected
                                        ? 'bg-card border-2 border-primary shadow-elevated ring-1 ring-primary/20'
                                        : 'bg-card border border-border/50 shadow-soft hover:border-primary/40',
                                    pkg.popular && !isSelected && 'md:scale-[1.03]'
                                )}
                            >
                                {/* Popular badge */}
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-card">
                                            <Star className="w-3 h-3 fill-current" />
                                            Anbefalt
                                        </span>
                                    </div>
                                )}

                                {/* Selected check */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-4 right-4 w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                                    >
                                        <Check className="w-4 h-4 text-primary-foreground" />
                                    </motion.div>
                                )}

                                {/* Name */}
                                <h3 className="font-serif text-lg font-bold text-card-foreground mt-1 pr-8">
                                    {pkg.name}
                                </h3>

                                {/* Price */}
                                <div className="mt-3 mb-5">
                                    <span className="text-xs text-muted-foreground">fra </span>
                                    <span className="text-3xl font-bold text-foreground">
                                        {pkg.price.toLocaleString('nb-NO')}
                                    </span>
                                    <span className="text-base text-muted-foreground"> kr</span>
                                </div>

                                {/* Items */}
                                <ul className="space-y-2.5 flex-1">
                                    {pkg.items.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-card-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div
                                    className={cn(
                                        'mt-5 py-2.5 rounded-full text-center text-sm font-semibold transition-colors',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-foreground group-hover:bg-primary/10'
                                    )}
                                >
                                    {isSelected ? 'Valgt ✓' : 'Velg pakke'}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
