import { motion } from 'framer-motion';
import { ScrollText, Clock, XCircle, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
    {
        icon: ScrollText,
        title: 'Slik bestiller du',
        items: [
            'Velg ønsket produkt fra menyen vår (kaker, cupcakes, cookies, sabayad).',
            'Fyll inn bestillingsskjemaet med anledning, beskrivelse og ønsker.',
            'Du mottar en ordrebekreftelse med referansenummer på e-post.',
            'Vi kontakter deg for å bekrefte bestillingen og avtale utlevering.',
        ],
    },
    {
        icon: Clock,
        title: 'Bestillingsfrister',
        items: [
            'Kaker bør bestilles minst 3–5 dager i forveien for å sikre best mulig kvalitet.',
            'Større bestillinger (bryllup, store fester) bør bestilles minst 1–2 uker i forveien.',
            'Cupcakes, cookies og annet småbakst kan bestilles med kortere frist.',
            'Kontakt oss på e-post hvis du har det travelt — vi prøver alltid å hjelpe!',
        ],
    },
    {
        icon: XCircle,
        title: 'Kansellering',
        items: [
            'Bestillinger kan kanselleres inntil 48 timer før avtalt utlevering.',
            'Bruk kanselleringssiden — du trenger ordrereferansen og e-postadressen du brukte ved bestilling.',
            'Du mottar en bekreftelse på e-post når kanselleringen er gjennomført.',
            'Bestillinger som allerede er påbegynt kan dessverre ikke kanselleres.',
        ],
        cta: { label: 'Gå til kansellering', to: '/kanseller' },
    },
    {
        icon: CreditCard,
        title: 'Betaling',
        items: [
            'Betaling avtales direkte med oss ved bekreftelse av bestillingen.',
            'Vi aksepterer Vipps og kontant betaling ved utlevering.',
            'Prisen avhenger av størrelse, design og spesielle ønsker.',
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Allergener og spesialkost',
        items: [
            'Oppgi eventuelle allergier eller kostholdsbehov i bestillingsskjemaet.',
            'Vi tilbyr alternativer for de fleste vanlige allergener.',
            'Alle produktene våre kan inneholde spor av nøtter, egg, melk og gluten.',
            'Kontakt oss på e-post for spesifikke spørsmål om ingredienser.',
        ],
    },
    {
        icon: HelpCircle,
        title: 'Spørsmål?',
        items: [
            'Send oss en e-post på afnanbakes@outlook.com.',
            'Følg oss på Instagram og TikTok @AfnanBakes for inspirasjon og nyheter.',
            'Vi svarer vanligvis innen 24 timer.',
        ],
    },
];

export default function RulesPage() {
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
                            <ScrollText className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Slik fungerer det
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Alt du trenger å vite om bestilling, kansellering og utlevering
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Sections */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-3xl space-y-12">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <section.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold text-foreground">{section.title}</h2>
                            </div>

                            <ul className="space-y-3">
                                {section.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" />
                                        <p className="text-muted-foreground leading-relaxed">{item}</p>
                                    </li>
                                ))}
                            </ul>

                            {section.cta && (
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <Link
                                        to={section.cta.to}
                                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                                    >
                                        {section.cta.label} →
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    <div className="text-center pt-8">
                        <Link to="/">
                            <span className="text-sm text-primary hover:underline">← Tilbake til forsiden</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
