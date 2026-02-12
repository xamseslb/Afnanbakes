import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Cake, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/hooks/useAdmin';

const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated } = useAdmin();
    const navigate = useNavigate();

    // If already authenticated, redirect
    if (isAuthenticated) {
        navigate(`/${ADMIN}/dashboard`, { replace: true });
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(password)) {
            navigate(`/${ADMIN}/dashboard`, { replace: true });
        } else {
            setError('Feil passord. Prøv igjen.');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
                    >
                        <Cake className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Afnan<span className="text-primary">Bakes</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">Admin Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Logg inn</h2>
                            <p className="text-sm text-muted-foreground">Skriv inn admin-passordet</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passord"
                                className="h-12 pr-12 bg-background border-border/50 focus:border-primary/50 rounded-xl text-base"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-destructive font-medium"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-base font-semibold shadow-soft hover:shadow-card transition-all duration-300"
                        >
                            Logg inn
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground/60 mt-6">
                    &copy; AfnanBakes Admin
                </p>
            </motion.div>
        </div>
    );
}
