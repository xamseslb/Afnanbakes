import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    Clock,
    CheckCircle2,
    Package,
    XCircle,
    Mail,
    Phone,
    User,
    Calendar,
    FileText,
    Image as ImageIcon,
    Sparkles,
    Copy,
    CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    fetchOrders,
    updateOrderStatus,
    statusLabels,
    statusColors,
    type OrderRow,
    type OrderStatus,
} from '@/lib/adminService';

const allStatuses: OrderStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusIcons: Record<OrderStatus, React.ElementType> = {
    pending: Clock,
    confirmed: Package,
    completed: CheckCircle2,
    cancelled: XCircle,
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short',
    });
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
    const [updating, setUpdating] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setLoading(false);
    }

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                order.order_ref?.toLowerCase().includes(query) ||
                order.customer_name?.toLowerCase().includes(query) ||
                order.customer_email?.toLowerCase().includes(query) ||
                order.product_type?.toLowerCase().includes(query) ||
                order.occasion?.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });
    }, [orders, statusFilter, searchQuery]);

    // Update status
    async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
        setUpdating(true);
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
            }
        }
        setUpdating(false);
    }

    // Copy ref
    function copyOrderRef(ref: string) {
        navigator.clipboard.writeText(ref);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Bestillinger</h1>
                <p className="text-muted-foreground mt-1">
                    {orders.length} bestilling{orders.length !== 1 ? 'er' : ''} totalt
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Søk etter referanse, kunde, produkt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 rounded-xl bg-card border-border/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {(['all', ...allStatuses] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${statusFilter === status
                                    ? status === 'all'
                                        ? 'bg-foreground text-background'
                                        : statusColors[status]
                                    : 'bg-card text-muted-foreground hover:bg-accent border border-border/50'
                                }`}
                        >
                            {status === 'all' ? 'Alle' : statusLabels[status]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm text-muted-foreground">
                    Viser {filteredOrders.length} av {orders.length} bestillinger
                </p>
            )}

            {/* Orders Table */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">Ingen bestillinger funnet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            Prøv å endre søk eller filter
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border/50">
                            <div className="col-span-2">Referanse</div>
                            <div className="col-span-2">Kunde</div>
                            <div className="col-span-2">Produkt</div>
                            <div className="col-span-2">Anledning</div>
                            <div className="col-span-2">Dato</div>
                            <div className="col-span-2">Status</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-border/50">
                            {filteredOrders.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                                    onClick={() => setSelectedOrder(order)}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer group"
                                >
                                    <div className="col-span-2 flex items-center">
                                        <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {order.order_ref || '—'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-foreground truncate">
                                            {order.customer_name || 'Ukjent'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {order.product_type || '—'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {order.occasion || '—'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {formatShortDate(order.created_at)}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Order Detail Drawer */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border/50 shadow-elevated z-50 overflow-y-auto"
                        >
                            {/* Drawer Header */}
                            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-foreground">
                                        Ordredetaljer
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-sm text-primary font-semibold">
                                            {selectedOrder.order_ref}
                                        </span>
                                        {selectedOrder.order_ref && (
                                            <button
                                                onClick={() => copyOrderRef(selectedOrder.order_ref)}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {copiedRef ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status Update */}
                                <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
                                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Endre status
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {allStatuses.map((status) => {
                                            const Icon = statusIcons[status];
                                            const isActive = selectedOrder.status === status;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(selectedOrder.id, status)}
                                                    disabled={isActive || updating}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                            ? `${statusColors[status]} ring-2 ring-offset-2 ring-current`
                                                            : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {statusLabels[status]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kundeinformasjon</p>
                                    <div className="space-y-2">
                                        {selectedOrder.customer_name && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground">{selectedOrder.customer_name}</span>
                                            </div>
                                        )}
                                        {selectedOrder.customer_email && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <a href={`mailto:${selectedOrder.customer_email}`} className="text-primary hover:underline">
                                                    {selectedOrder.customer_email}
                                                </a>
                                            </div>
                                        )}
                                        {selectedOrder.customer_phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <a href={`tel:${selectedOrder.customer_phone}`} className="text-primary hover:underline">
                                                    {selectedOrder.customer_phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bestillingsdetaljer</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DetailCard label="Anledning" value={selectedOrder.occasion} />
                                        <DetailCard label="Produkt" value={selectedOrder.product_type} />
                                        <DetailCard label="Antall" value={selectedOrder.quantity} />
                                        <DetailCard
                                            label="Bestilt"
                                            value={formatDate(selectedOrder.created_at)}
                                        />
                                        {selectedOrder.cake_name && (
                                            <DetailCard label="Kakenavn" value={selectedOrder.cake_name} />
                                        )}
                                        {selectedOrder.cake_text && (
                                            <DetailCard label="Tekst på kake" value={selectedOrder.cake_text} />
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedOrder.description && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" />
                                            Beskrivelse
                                        </p>
                                        <p className="text-sm text-foreground bg-muted/30 rounded-xl p-4 leading-relaxed">
                                            {selectedOrder.description}
                                        </p>
                                    </div>
                                )}

                                {/* Ideas */}
                                {selectedOrder.ideas && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Idéer / Ønsker
                                        </p>
                                        <p className="text-sm text-foreground bg-muted/30 rounded-xl p-4 leading-relaxed">
                                            {selectedOrder.ideas}
                                        </p>
                                    </div>
                                )}

                                {/* Images */}
                                {selectedOrder.image_urls && selectedOrder.image_urls.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Referansebilder ({selectedOrder.image_urls.length})
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedOrder.image_urls.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                                                >
                                                    <img src={url} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground capitalize">{value || '—'}</p>
        </div>
    );
}
