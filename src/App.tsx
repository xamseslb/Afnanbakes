/**
 * App — Hovedkomponent med routing, providers og layout.
 * Setter opp React Query, handlekurv, toast-varsler og alle ruter.
 */
import { useLayoutEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from '@/hooks/useCart';
import { Layout } from '@/components/layout/Layout';
import Index from './pages/Index';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCalendar from './pages/AdminCalendar';
import CancelOrder from './pages/CancelOrder';
import OrderConfirmation from './pages/OrderConfirmation';
import AboutPage from './pages/AboutPage';
import RulesPage from './pages/RulesPage';
import PricingPage from './pages/PricingPage';

/** React Query klient for datahenting */
const queryClient = new QueryClient();

/** Admin-sti fra miljøvariabel (hemmelig URL) */
const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';

/** Scroller til toppen ved navigasjon mellom sider */
function ScrollToTop() {
  const { pathname } = useLocation();

  // Deaktiver nettleserens innebygde scroll-gjenoppretting
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Fang alle klikk på interne lenker og scroll til toppen
  useLayoutEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (
        anchor &&
        anchor.href &&
        anchor.origin === window.location.origin &&
        !anchor.getAttribute('href')?.startsWith('#') &&
        !anchor.getAttribute('target')
      ) {
        // Intern navigasjon — scroll til toppen umiddelbart
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
        }, 0);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Backup: scroll ved ruteendring
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    const t1 = setTimeout(() => window.scrollTo(0, 0), 0);
    const t2 = setTimeout(() => window.scrollTo(0, 0), 100);
    const t3 = setTimeout(() => window.scrollTo(0, 0), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ── Offentlige ruter — med Header og Footer via Layout ── */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/priser" element={<PricingPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/cakes" element={<CategoryPage />} />
              <Route path="/cupcakes" element={<CategoryPage />} />
              <Route path="/cookies" element={<CategoryPage />} />
              <Route path="/sabayad" element={<CategoryPage />} />
              <Route path="/kanseller" element={<CancelOrder />} />
              <Route path="/ordre-bekreftelse" element={<OrderConfirmation />} />
              <Route path="/om-oss" element={<AboutPage />} />
              <Route path="/regler" element={<RulesPage />} />
            </Route>

            {/* ── Admin-ruter — hemmelig sti, eget layout ── */}
            <Route path={`/${ADMIN}`} element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path={`/${ADMIN}/dashboard`} element={<AdminDashboard />} />
              <Route path={`/${ADMIN}/orders`} element={<AdminOrders />} />
              <Route path={`/${ADMIN}/calendar`} element={<AdminCalendar />} />
            </Route>

            {/* ── 404 — alle ukjente ruter ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
