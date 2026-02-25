/**
 * AdminOrders — Oversiktlig ordreliste med søk, filter og fullskjerm detaljvisning.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    X,
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
    ChevronRight,
    Cake,
    MessageSquare,
    Hash,
    CreditCard,
    ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    fetchOrders,
    updateOrderStatus,
    statusLabels,
    statusColors,
    type OrderRow,
    type OrderStatus,
} from '@/lib/adminService';
import { formatNorwegianDate } from '@/lib/calendarService';

const allStatuses: OrderStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusIcons: Record<string, React.ElementType> = {
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

function formatRelativeDate(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Akkurat nå';
    if (diffMins < 60) return `${diffMins} min siden`;
    if (diffHours < 24) return `${diffHours} t siden`;
    if (diffDays < 7) return `${diffDays} d siden`;
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

// ─── Hovedkomponent ───────────────────────────────────────────────────────────

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

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                order.order_ref?.toLowerCase().includes(query) ||
                order.customer_name?.toLowerCase().includes(query) ||
                order.customer_email?.toLowerCase().includes(query) ||
                order.package_name?.toLowerCase().includes(query) ||
                order.occasion?.toLowerCase().includes(query) ||
                order.description?.toLowerCase().includes(query) ||
                order.cake_text?.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });
    }, [orders, statusFilter, searchQuery]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        allStatuses.forEach((s) => {
            counts[s] = orders.filter((o) => o.status === s).length;
        });
        return counts;
    }, [orders]);

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

    function copyOrderRef(ref: string) {
        navigator.clipboard.writeText(ref);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
    }

    // ─── Lasting ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ─── Fullskjerm detaljvisning ─────────────────────────────────────────────

    if (selectedOrder) {
        const ActiveStatusIcon = statusIcons[selectedOrder.status];
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Tilbake-knapp + status */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Tilbake til liste
                    </button>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                        <ActiveStatusIcon className="w-3.5 h-3.5" />
                        {statusLabels[selectedOrder.status]}
                    </span>
                </div>

                {/* Ordrehode */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="font-serif text-2xl font-bold text-foreground">Bestilling</h1>
                        <span className="font-mono text-lg text-primary font-bold">{selectedOrder.order_ref}</span>
                        {selectedOrder.order_ref && (
                            <button
                                onClick={() => copyOrderRef(selectedOrder.order_ref)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Kopier referanse"
                            >
                                {copiedRef ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Bestilt {formatDate(selectedOrder.created_at)}
                    </p>
                    {selectedOrder.delivery_date && (
                        <p className="text-sm font-medium text-primary mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Leveres: {formatNorwegianDate(selectedOrder.delivery_date)}
                        </p>
                    )}
                </div>

                {/* To kolonner på desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Venstre kolonne — Bestillingsdetaljer */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Bestillingsdetaljer */}
                        <Section title="Bestillingsdetaljer">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <DetailCard icon={Calendar} label="Anledning" value={selectedOrder.occasion} />
                                <DetailCard icon={Cake} label="Pakke" value={selectedOrder.package_name || selectedOrder.product_type || '—'} />
                                {selectedOrder.package_price != null && (
                                    <DetailCard icon={CreditCard} label="Pris" value={`${selectedOrder.package_price.toLocaleString('nb-NO')} kr`} />
                                )}
                                {selectedOrder.quantity && (
                                    <DetailCard icon={Hash} label="Antall" value={selectedOrder.quantity} />
                                )}
                                {selectedOrder.is_custom_design && (
                                    <DetailCard icon={Sparkles} label="Design" value="Eget design" />
                                )}
                            </div>
                        </Section>

                        {/* Kaketekst */}
                        {(selectedOrder.cake_name || selectedOrder.cake_text) && (
                            <Section title="Kaketekst" icon={Cake}>
                                <div className="space-y-4">
                                    {selectedOrder.cake_name && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Navn på kaken</p>
                                            <p className="text-base font-medium text-foreground bg-primary/5 rounded-xl px-4 py-3">
                                                {selectedOrder.cake_name}
                                            </p>
                                        </div>
                                    )}
                                    {selectedOrder.cake_text && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Tekst på kaken</p>
                                            <p className="text-base font-medium text-foreground bg-primary/5 rounded-xl px-4 py-3 italic">
                                                „{selectedOrder.cake_text}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Section>
                        )}

                        {/* Beskrivelse */}
                        {selectedOrder.description && (
                            <Section title="Beskrivelse fra kunden" icon={FileText}>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedOrder.description}
                                </p>
                            </Section>
                        )}

                        {/* Idéer */}
                        {selectedOrder.ideas && (
                            <Section title="Idéer og ønsker" icon={MessageSquare}>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedOrder.ideas}
                                </p>
                            </Section>
                        )}

                        {/* Referansebilder */}
                        {selectedOrder.image_urls && selectedOrder.image_urls.length > 0 && (
                            <Section title={`Referansebilder (${selectedOrder.image_urls.length})`} icon={ImageIcon}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {selectedOrder.image_urls.map((url, i) => (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-80 transition-opacity ring-1 ring-border/30"
                                        >
                                            <img src={url} alt={`Referansebilde ${i + 1}`} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Høyre kolonne — Kunde + Status */}
                    <div className="space-y-5">
                        {/* Kundeinformasjon */}
                        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kundeinformasjon</p>
                            </div>
                            <div className="p-5 space-y-4">
                                {selectedOrder.customer_name && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-lg">{selectedOrder.customer_name}</p>
                                            <p className="text-xs text-muted-foreground">Kunde</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {selectedOrder.customer_email && (
                                        <a
                                            href={`mailto:${selectedOrder.customer_email}`}
                                            className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                                        >
                                            <Mail className="w-5 h-5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">Send e-post</p>
                                                <p className="text-xs truncate opacity-80">{selectedOrder.customer_email}</p>
                                            </div>
                                        </a>
                                    )}
                                    {selectedOrder.customer_phone && (
                                        <a
                                            href={`tel:${selectedOrder.customer_phone}`}
                                            className="flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <div>
                                                <p className="text-sm font-medium">Ring kunde</p>
                                                <p className="text-xs opacity-80">{selectedOrder.customer_phone}</p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Endre status */}
                        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Endre status
                                </p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-2">
                                    {allStatuses.map((status) => {
                                        const Icon = statusIcons[status];
                                        const isActive = selectedOrder.status === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedOrder.id, status)}
                                                disabled={isActive || updating}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                    ? `${statusColors[status]} ring-2 ring-offset-2 ring-current`
                                                    : 'bg-muted/30 border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {statusLabels[status]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ─── Ordreliste ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Overskrift */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Bestillinger</h1>
                <p className="text-muted-foreground mt-1">
                    {orders.length} bestilling{orders.length !== 1 ? 'er' : ''} totalt
                </p>
            </div>

            {/* Søk */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Søk etter referanse, kunde, produkt, tekst..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-card border-border/50"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title="Tøm søk"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Statusfilter */}
            <div className="flex gap-2 flex-wrap">
                {(['all', ...allStatuses] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${statusFilter === status
                            ? status === 'all'
                                ? 'bg-foreground text-background'
                                : statusColors[status]
                            : 'bg-card text-muted-foreground hover:bg-accent border border-border/50'
                            }`}
                    >
                        {status === 'all' ? 'Alle' : statusLabels[status]}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === status ? 'bg-white/20' : 'bg-muted'}`}>
                            {statusCounts[status]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Antall resultater */}
            {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm text-muted-foreground">
                    Viser {filteredOrders.length} av {orders.length} bestillinger
                </p>
            )}

            {/* Ordrekort */}
            {filteredOrders.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
                    <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Ingen bestillinger funnet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Prøv å endre søk eller filter</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order, i) => {
                        const StatusIcon = statusIcons[order.status];
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group overflow-hidden"
                            >
                                {/* Kort-topp */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-bold text-primary">{order.order_ref || '—'}</span>
                                        <span className="text-xs text-muted-foreground">{formatRelativeDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusLabels[order.status]}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Kort-innhold */}
                                <div className="px-5 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-base truncate">
                                                {order.customer_name || 'Ukjent kunde'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                {order.customer_email && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="w-3 h-3" />{order.customer_email}
                                                    </span>
                                                )}
                                                {order.customer_phone && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3" />{order.customer_phone}
                                                    </span>
                                                )}
                                            </div>
                                            {order.delivery_date && (
                                                <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Leveres: {new Date(order.delivery_date + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                                            {order.occasion && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-lg capitalize">
                                                    <Calendar className="w-3 h-3 text-primary" />{order.occasion}
                                                </span>
                                            )}
                                            {(order.package_name || order.product_type) && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                                                    <Cake className="w-3 h-3 text-primary" />{order.package_name || order.product_type}
                                                </span>
                                            )}
                                            {order.package_price != null && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                    <CreditCard className="w-3 h-3" />{order.package_price.toLocaleString('nb-NO')} kr
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {(order.description || order.cake_text || order.cake_name) && (
                                        <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
                                            {order.cake_text && (
                                                <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground/80">Tekst på kake:</span> {order.cake_text}
                                                </p>
                                            )}
                                            {order.cake_name && (
                                                <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground/80">Kakenavn:</span> {order.cake_name}
                                                </p>
                                            )}
                                            {order.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    <span className="font-medium text-foreground/80">Beskrivelse:</span> {order.description}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {order.image_urls && order.image_urls.length > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                            <ImageIcon className="w-3 h-3" />
                                            {order.image_urls.length} bilde{order.image_urls.length !== 1 ? 'r' : ''} vedlagt
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Hjelpkomponenter ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {title}
                </p>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function DetailCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className="text-sm font-medium text-foreground capitalize">{value || '—'}</p>
        </div>
    );
}
