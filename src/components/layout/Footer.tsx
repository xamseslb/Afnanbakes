/**
 * Footer — Bunntekst med kontaktinfo, sosiale medier og copyright.
 */
import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Afnan<span className="text-primary">Bakes</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Håndlagde kaker og bakverk med kjærlighet i Oslo. Spesialisert på
              både vestlige klassikere og autentisk somalisk bakst.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Hurtiglenker
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/priser"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Priser
                </Link>
              </li>
              <li>
                <Link
                  to="/om-oss"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Om oss
                </Link>
              </li>
              <li>
                <Link
                  to="/regler"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Slik fungerer det
                </Link>
              </li>
              <li>
                <Link
                  to="/kanseller"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Kanseller bestilling
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Kontakt
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Oslo, Norge
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                afnanbakes@outlook.com
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Følg oss
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/afnanBakes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@afnanBakes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AfnanBakes. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  );
}
