/**
 * AdminLogin — Innloggingsside for admin-panelet.
 * Bruker Supabase Auth (e-post + passord).
 * Inkluderer brute-force-beskyttelse (5 forsøk → 5 min lockout).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Cake, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/hooks/useAdmin';

const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 5 * 60; // 5 minutter

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [lockoutRemaining, setLockoutRemaining] = useState(0);
    const lockoutTimer = useRef<ReturnType<typeof setInterval>>();
    const { login, isAuthenticated, loading } = useAdmin();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(`/${ADMIN}/dashboard`, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Lockout nedtelling
    useEffect(() => {
        if (!lockoutUntil) return;
        const tick = () => {
            const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
            setLockoutRemaining(remaining);
            if (remaining <= 0) {
                setLockoutUntil(null);
                setAttempts(0);
                clearInterval(lockoutTimer.current);
            }
        };
        tick();
        lockoutTimer.current = setInterval(tick, 1000);
        return () => clearInterval(lockoutTimer.current);
    }, [lockoutUntil]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLockedOut) return;
        setError('');
        setSubmitting(true);

        const result = await login(email, password);

        if (!result.success) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
                setError(`For mange forsøk. Prøv igjen om ${Math.ceil(LOCKOUT_SECONDS / 60)} minutter.`);
            } else {
                setError(
                    result.error === 'Invalid login credentials'
                        ? `Feil e-post eller passord. ${MAX_ATTEMPTS - newAttempts} forsøk gjenstår.`
                        : result.error || 'Innlogging feilet.'
                );
            }
            setPassword('');
        }
        // Redirect happens via useEffect when isAuthenticated changes

        setSubmitting(false);
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
                            <p className="text-sm text-muted-foreground">Bruk admin-kontoen din</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-post"
                                className="h-12 pl-11 bg-background border-border/50 focus:border-primary/50 rounded-xl text-base"
                                autoFocus
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passord"
                                className="h-12 pl-11 pr-12 bg-background border-border/50 focus:border-primary/50 rounded-xl text-base"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
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
                            disabled={submitting || isLockedOut}
                            className="w-full h-12 rounded-xl text-base font-semibold shadow-soft hover:shadow-card transition-all duration-300"
                        >
                            {isLockedOut
                                ? `Låst (${Math.floor(lockoutRemaining / 60)}:${String(lockoutRemaining % 60).padStart(2, '0')})`
                                : submitting ? 'Logger inn…' : 'Logg inn'}
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
