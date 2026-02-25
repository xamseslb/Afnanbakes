import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, CalendarDays, LogOut, Cake, ChevronLeft } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';

const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';

const navItems = [
    { to: `/${ADMIN}/dashboard`, label: 'Oversikt', icon: LayoutDashboard },
    { to: `/${ADMIN}/orders`, label: 'Bestillinger', icon: ClipboardList },
    { to: `/${ADMIN}/calendar`, label: 'Kalender', icon: CalendarDays },
];

export default function AdminLayout() {
    const { isAuthenticated, loading, logout } = useAdmin();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={`/${ADMIN}`} replace />;
    }

    const handleLogout = async () => {
        await logout();
        navigate(`/${ADMIN}`);
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-64 bg-card border-r border-border/50 flex flex-col fixed h-full z-30"
            >
                {/* Logo */}
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Cake className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-serif text-lg font-bold text-foreground">
                                Afnan<span className="text-primary">Bakes</span>
                            </h1>
                            <p className="text-xs text-muted-foreground">Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary shadow-soft'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-border/50 space-y-2">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Tilbake til siden
                    </NavLink>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                        <LogOut className="w-5 h-5" />
                        Logg ut
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <div className="p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
