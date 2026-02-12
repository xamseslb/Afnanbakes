import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Clock, ShoppingBag, ArrowRight, TrendingUp } from 'lucide-react';
import {
    fetchOrders,
    getOrderStats,
    statusLabels,
    statusColors,
    type OrderRow,
} from '@/lib/adminService';

const ADMIN = import.meta.env.VITE_ADMIN_PATH || 'admin';

const statCards = [
    { key: 'pending' as const, label: 'Nye bestillinger', icon: Clock, gradient: 'from-amber-500 to-amber-600' },
    { key: 'confirmed' as const, label: 'Bekreftet', icon: Package, gradient: 'from-blue-500 to-blue-600' },
    { key: 'completed' as const, label: 'Fullførte', icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600' },
    { key: 'total' as const, label: 'Totalt', icon: ShoppingBag, gradient: 'from-primary to-gold-dark' },
];

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminDashboard() {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders().then((data) => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const stats = getOrderStats(orders);
    const recentOrders = orders.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Oversikt</h1>
                <p className="text-muted-foreground mt-1">Velkommen tilbake! Her er en oversikt over bestillingene.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover:shadow-card transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                            {card.key === 'pending' && stats.pending > 0 && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse">
                                    {stats.pending}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {stats[card.key]}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Siste bestillinger</h2>
                            <p className="text-sm text-muted-foreground">De {recentOrders.length} nyeste</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/${ADMIN}/orders`)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Se alle
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Ingen bestillinger ennå</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 px-6 hover:bg-accent/30 transition-colors cursor-pointer"
                                onClick={() => navigate('/admin/orders')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {order.product_type?.slice(0, 2).toUpperCase() || '??'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">
                                            {order.customer_name || 'Ukjent kunde'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.order_ref || '—'} · {order.product_type} · {order.occasion}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground hidden sm:block">
                                        {formatDate(order.created_at)}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
