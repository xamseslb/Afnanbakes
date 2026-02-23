/**
 * HomeSections — Forsidekort under hero-seksjonen.
 * Inkluderer anmeldelser, «Slik fungerer det»-steg, og produktkategorier.
 */
import { motion } from 'framer-motion';
import { Star, Cake, ClipboardList, Send, Truck, Heart, Cookie, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* ──────────────────── Testimonials ──────────────────── */
const testimonials = [
    {
        name: 'Sara M.',
        text: 'Bestilte bryllupskake og den var helt perfekt! Smaken var utrolig og designet var akkurat som vi ønsket.',
        stars: 5,
        occasion: 'Bryllup',
    },
    {
        name: 'Fatima A.',
        text: 'Kakene var fantastiske — hele familien elsket dem. Bestiller igjen neste år!',
        stars: 5,
        occasion: 'Feiring',
    },
    {
        name: 'Lina K.',
        text: 'Cupcakesene til babyshoweren var så vakre og smakte himmelsk. Anbefales på det sterkeste!',
        stars: 5,
        occasion: 'Baby shower',
    },
    {
        name: 'Amina H.',
        text: 'Bursdagskaken til datteren min ble bedre enn jeg drømte om. Afnan er utrolig dyktig!',
        stars: 5,
        occasion: 'Bursdag',
    },
];

/* ──────────────────── How It Works ──────────────────── */
const steps = [
    {
        icon: ClipboardList,
        title: 'Velg produkt',
        desc: 'Bla gjennom kaker, cupcakes og cookies — finn det som passer deg.',
    },
    {
        icon: Send,
        title: 'Tilpass & bestill',
        desc: 'Velg størrelse, smak, farge og dekor. Fyll inn leveringsdato og kontaktinfo.',
    },
    {
        icon: Cake,
        title: 'Vi baker',
        desc: 'Alt håndlages med de fineste ingrediensene, spesielt for deg.',
    },
    {
        icon: Truck,
        title: 'Hent & nyt',
        desc: 'Hent din bestilling fersk og klar — nå er det fest!',
    },
];

/* ──────────────────── Products ──────────────────── */
const products = [
    { icon: Cake, name: 'Kaker', desc: 'Skreddersydde for deg', link: '/cakes' },
    { icon: Heart, name: 'Cupcakes', desc: 'Dekorerte med kjærlighet', link: '/cupcakes' },
    { icon: Cookie, name: 'Cookies', desc: 'Hjemmelagde og sprø', link: '/cookies' },
];

/* ──────────────────── Main Component ──────────────────── */
export function HomeSections() {
    return (
        <div className="w-full">
            {/* ── How It Works ── */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Slik fungerer det
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Fra bestilling til ferdig kake — enkelt og trygt
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-soft text-center"
                            >
                                {/* Step number */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                                    {i + 1}
                                </div>
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mt-2 mb-4">
                                    <step.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── What We Offer ── */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Hva vi tilbyr
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Håndlaget bakst for enhver anledning
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {products.map((prod, i) => (
                            <Link key={prod.name} to={prod.link} className="h-full">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-card rounded-sm p-6 border border-border/50 shadow-soft text-center hover:shadow-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <prod.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground text-sm">{prod.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{prod.desc}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/priser">
                            <Button variant="outline" className="rounded-full gap-2">
                                Se priser og pakker →
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Hva kundene sier
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Vi er stolte av hver eneste tilbakemelding
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
                            >
                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: t.stars }).map((_, s) => (
                                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-foreground leading-relaxed mb-4 italic">
                                    "{t.text}"
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                        {t.occasion}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-hero rounded-3xl p-10 md:p-14 text-center"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Klar til å bestille?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                            Start bestillingen din nå og la oss skape noe magisk sammen
                        </p>
                        <Link to="/">
                            <Button
                                size="lg"
                                className="rounded-full text-lg px-8 py-6 shadow-elevated hover:shadow-card transition-all duration-300"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                Bestill nå ✨
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
