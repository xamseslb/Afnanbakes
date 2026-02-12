import { motion } from 'framer-motion';
import { Cake, Heart, Star, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-24 bg-gradient-hero overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6">
                            <Cake className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Om Afnan<span className="text-primary">Bakes</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Håndlagde kaker og bakverk med kjærlighet i Oslo
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="font-serif text-3xl font-bold text-foreground">Vår historie</h2>
                        </div>

                        <p className="text-muted-foreground leading-relaxed text-lg">
                            AfnanBakes ble startet med en enkel drøm — å dele gleden av hjemmelaget bakst med alle rundt oss.
                            Det som begynte som en hobby på kjøkkenet, har vokst til et bakeri som spesialiserer seg på
                            alt fra elegante bryllupskaker til autentisk somalisk bakst.
                        </p>

                        <p className="text-muted-foreground leading-relaxed text-lg">
                            Hver kake, cupcake og bakverk vi lager er håndlaget med de fineste ingrediensene og mye
                            kjærlighet. Vi tror på at god mat bringer mennesker sammen, og vi er stolte av å være en
                            del av dine spesielle øyeblikk.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
                            Hva vi står for
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Heart,
                                    title: 'Kjærlighet',
                                    desc: 'Alt vi lager er bakt med lidenskap og omsorg. Vi tar stolthet i hvert eneste produkt.',
                                },
                                {
                                    icon: Star,
                                    title: 'Kvalitet',
                                    desc: 'Vi bruker kun de fineste ingrediensene for å sikre den beste smaken i hver bit.',
                                },
                                {
                                    icon: Cake,
                                    title: 'Tradisjon',
                                    desc: 'Vi kombinerer vestlige kakeklassikere med autentisk somalisk bakst og smak.',
                                },
                            ].map((value, i) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="bg-card rounded-2xl p-8 border border-border/50 text-center shadow-soft"
                                >
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                                        <value.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
                            Hva vi tilbyr
                        </h2>

                        <div className="space-y-6">
                            {[
                                { name: 'Kaker', desc: 'Skreddersydde kaker for bryllup, bursdag, Eid og alle anledninger' },
                                { name: 'Cupcakes', desc: 'Dekorerte cupcakes i ulike smaker — perfekt for fester og gaver' },
                                { name: 'Cookies', desc: 'Hjemmelagde cookies som smelter på tungen' },
                                { name: 'Sambosa', desc: 'Autentisk somalisk sambosa — sprø og full av smak' },
                                { name: 'Sabayad', desc: 'Tradisjonelt somalisk brød, perfekt til frokost og middag' },
                            ].map((item) => (
                                <div key={item.name} className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border/50">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2.5 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-serif text-3xl font-bold text-foreground mb-8">Kontakt oss</h2>

                        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft space-y-4">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>Oslo, Norge</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Mail className="w-5 h-5 text-primary" />
                                <a href="mailto:afnanbakes@outlook.com" className="hover:text-primary transition-colors">
                                    afnanbakes@outlook.com
                                </a>
                            </div>

                            <div className="flex items-center justify-center gap-4 pt-4">
                                <a
                                    href="https://instagram.com/afnanBakes"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    @AfnanBakes på Instagram
                                </a>
                                <span className="text-border">•</span>
                                <a
                                    href="https://www.tiktok.com/@afnanBakes"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    @AfnanBakes på TikTok
                                </a>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link to="/">
                                <span className="text-sm text-primary hover:underline">← Tilbake til forsiden</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
