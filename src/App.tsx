import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import CancelOrder from "./pages/CancelOrder";
import AboutPage from "./pages/AboutPage";
import RulesPage from "./pages/RulesPage";
import PricingPage from "./pages/PricingPage";

const queryClient = new QueryClient();
const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes — wrapped with Header + Footer via Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/priser" element={<PricingPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/cakes" element={<CategoryPage />} />
              <Route path="/cupcakes" element={<CategoryPage />} />
              <Route path="/cookies" element={<CategoryPage />} />
              <Route path="/sambosa" element={<CategoryPage />} />
              <Route path="/sabayad" element={<CategoryPage />} />
              <Route path="/kanseller" element={<CancelOrder />} />
              <Route path="/om-oss" element={<AboutPage />} />
              <Route path="/regler" element={<RulesPage />} />
            </Route>
            {/* Admin Routes — secret path from .env, own layout */}
            <Route path={`/${ADMIN}`} element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path={`/${ADMIN}/dashboard`} element={<AdminDashboard />} />
              <Route path={`/${ADMIN}/orders`} element={<AdminOrders />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
