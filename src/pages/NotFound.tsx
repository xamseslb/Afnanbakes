/**
 * NotFound — 404-side som vises når en rute ikke finnes.
 */
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404: Brukeren prøvde å besøke en ukjent side:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Siden ble ikke funnet</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Tilbake til forsiden
        </a>
      </div>
    </div>
  );
};

export default NotFound;
