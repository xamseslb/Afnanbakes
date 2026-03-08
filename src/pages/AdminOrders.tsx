/**
 * AdminOrders — Ordreliste med gruppering: alle produkter fra samme bestilling
 * vises som ett kort med produktliste, ikke som separate rader.
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
    CreditCard,
    ArrowLeft,
    ShoppingBag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    fetchOrders,
    groupOrders,
    updateGroupStatus,
    statusLabels,
    statusColors,
    type GroupedOrder,
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

// ─── Detaljvisning for én gruppe ──────────────────────────────────────────────

function GroupDetail({
    group,
    onBack,
    onStatusChange,
    updating,
}: {
    group: GroupedOrder;
    onBack: () => void;
    onStatusChange: (g: GroupedOrder, s: OrderStatus) => void;
    updating: boolean;
}) {
    const [copiedRef, setCopiedRef] = useState(false);
    const ActiveStatusIcon = statusIcons[group.status];

    function copyRef() {
        navigator.clipboard.writeText(group.baseRef);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Tilbake + status */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Tilbake til liste
                </button>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[group.status]}`}>
                    <ActiveStatusIcon className="w-3.5 h-3.5" />
                    {statusLabels[group.status]}
                </span>
            </div>

            {/* Ordrehode */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-serif text-2xl font-bold text-foreground">Bestilling</h1>
                    <span className="font-mono text-lg text-primary font-bold">{group.baseRef}</span>
                    <button
                        onClick={copyRef}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Kopier referanse"
                    >
                        {copiedRef ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-sm text-muted-foreground">Bestilt {formatDate(group.created_at)}</p>
                {group.delivery_dates.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                        {group.delivery_dates.map((d) => (
                            <p key={d} className="text-sm font-medium text-primary flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Hentes: {formatNorwegianDate(d)}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Venstre: produktliste */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Produkter i bestillingen */}
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="px-5 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {group.items.length} produkt{group.items.length !== 1 ? 'er' : ''}
                            </p>
                            <span className="font-bold text-primary text-sm">
                                Totalt: {group.total_price.toLocaleString('nb-NO')} kr
                            </span>
                        </div>
                        <div className="divide-y divide-border/30">
                            {group.items.map((item) => (
                                <div key={item.id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground flex items-center gap-2">
                                                <Cake className="w-4 h-4 text-primary shrink-0" />
                                                {item.package_name || item.cake_name || '—'}
                                            </p>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                            {item.cake_text && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <span className="font-medium">Tekst:</span> „{item.cake_text}"
                                                </p>
                                            )}
                                            {item.delivery_date && (
                                                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.delivery_date + 'T00:00:00').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-bold text-primary text-sm whitespace-nowrap shrink-0">
                                            {item.package_price != null ? `${item.package_price.toLocaleString('nb-NO')} kr` : '—'}
                                        </span>
                                    </div>

                                    {/* Bilder for dette produktet */}
                                    {item.edible_image_url && (
                                        <div className="mt-3">
                                            <p className="text-xs text-muted-foreground mb-1.5">🎂 Spiselig bilde:</p>
                                            <a href={item.edible_image_url} target="_blank" rel="noopener noreferrer"
                                                className="block w-20 h-20 rounded-xl overflow-hidden ring-2 ring-primary/30 hover:opacity-80 transition-opacity">
                                                <img src={item.edible_image_url} alt="Spiselig bilde" className="w-full h-full object-cover" />
                                            </a>
                                        </div>
                                    )}
                                    {item.image_urls && item.image_urls.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-muted-foreground mb-1.5">🖼️ Inspirasjonsbilder ({item.image_urls.length}):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.image_urls.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                        className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border/30 hover:opacity-80 transition-opacity">
                                                        <img src={url} alt={`Inspirasjon ${i + 1}`} className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Totalrad */}
                        <div className="px-5 py-3 bg-primary/5 border-t border-border/50 flex justify-between items-center">
                            <span className="text-sm font-semibold text-foreground">Totalbeløp</span>
                            <span className="text-lg font-bold text-primary">{group.total_price.toLocaleString('nb-NO')} kr</span>
                        </div>
                    </div>

                    {/* Samlede ideer/beskrivelse */}
                    {group.items.some((i) => i.ideas) && (
                        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" /> Idéer og ønsker
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {group.items.filter((i) => i.ideas).map((item) => (
                                    <p key={item.id} className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {item.ideas}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Høyre: kunde + status */}
                <div className="space-y-5">
                    {/* Kundeinformasjon */}
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kundeinformasjon</p>
                        </div>
                        <div className="p-5 space-y-4">
                            {group.customer_name && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-lg">{group.customer_name}</p>
                                        <p className="text-xs text-muted-foreground">Kunde</p>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {group.customer_email && (
                                    <a href={`mailto:${group.customer_email}`}
                                        className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors">
                                        <Mail className="w-5 h-5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">Send e-post</p>
                                            <p className="text-xs truncate opacity-80">{group.customer_email}</p>
                                        </div>
                                    </a>
                                )}
                                {group.customer_phone && (
                                    <a href={`tel:${group.customer_phone}`}
                                        className="flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors">
                                        <Phone className="w-5 h-5" />
                                        <div>
                                            <p className="text-sm font-medium">Ring kunde</p>
                                            <p className="text-xs opacity-80">{group.customer_phone}</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Endre status — gjelder alle produkter i bestillingen */}
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Endre status (alle produkter)
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-2">
                                {allStatuses.map((status) => {
                                    const Icon = statusIcons[status];
                                    const isActive = group.status === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => onStatusChange(group, status)}
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

// ─── Hovedkomponent ───────────────────────────────────────────────────────────

export default function AdminOrders() {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedGroup, setSelectedGroup] = useState<GroupedOrder | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => { loadOrders(); }, []);

    async function loadOrders() {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setLoading(false);
    }

    const groupedOrders = useMemo(() => groupOrders(orders), [orders]);

    const filteredGroups = useMemo(() => {
        return groupedOrders.filter((group) => {
            const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                group.baseRef.toLowerCase().includes(query) ||
                group.customer_name?.toLowerCase().includes(query) ||
                group.customer_email?.toLowerCase().includes(query) ||
                group.items.some((i) =>
                    i.package_name?.toLowerCase().includes(query) ||
                    i.description?.toLowerCase().includes(query) ||
                    i.cake_text?.toLowerCase().includes(query)
                );
            return matchesStatus && matchesSearch;
        });
    }, [groupedOrders, statusFilter, searchQuery]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: groupedOrders.length };
        allStatuses.forEach((s) => {
            counts[s] = groupedOrders.filter((g) => g.status === s).length;
        });
        return counts;
    }, [groupedOrders]);

    async function handleStatusChange(group: GroupedOrder, newStatus: OrderStatus) {
        setUpdating(true);
        const success = await updateGroupStatus(group.baseRef, newStatus);
        if (success) {
            setOrders((prev) =>
                prev.map((o) =>
                    o.order_ref.replace(/-\d+$/, '') === group.baseRef
                        ? { ...o, status: newStatus }
                        : o
                )
            );
            if (selectedGroup?.baseRef === group.baseRef) {
                setSelectedGroup((prev) => prev ? { ...prev, status: newStatus, items: prev.items.map(i => ({ ...i, status: newStatus })) } : null);
            }
        }
        setUpdating(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (selectedGroup) {
        return (
            <GroupDetail
                group={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                onStatusChange={handleStatusChange}
                updating={updating}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Bestillinger</h1>
                <p className="text-muted-foreground mt-1">
                    {groupedOrders.length} bestilling{groupedOrders.length !== 1 ? 'er' : ''} totalt
                </p>
            </div>

            {/* Søk */}
            <div className="relative">
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

            {/* Statusfilter */}
            <div className="flex gap-2 flex-wrap">
                {(['all', ...allStatuses] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${statusFilter === status
                            ? status === 'all' ? 'bg-foreground text-background' : statusColors[status]
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

            {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm text-muted-foreground">
                    Viser {filteredGroups.length} av {groupedOrders.length} bestillinger
                </p>
            )}

            {/* Gruppert ordreliste */}
            {filteredGroups.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
                    <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Ingen bestillinger funnet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredGroups.map((group, i) => {
                        const StatusIcon = statusIcons[group.status];
                        return (
                            <motion.div
                                key={group.baseRef}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                                onClick={() => setSelectedGroup(group)}
                                className="bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group overflow-hidden"
                            >
                                {/* Kort-topp */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-bold text-primary">{group.baseRef}</span>
                                        <span className="text-xs text-muted-foreground">{formatRelativeDate(group.created_at)}</span>
                                        {group.items.length > 1 && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                {group.items.length} produkter
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[group.status]}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusLabels[group.status]}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                {/* Kort-innhold */}
                                <div className="px-5 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-base truncate">
                                                {group.customer_name || 'Ukjent kunde'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                {group.customer_email && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="w-3 h-3" />{group.customer_email}
                                                    </span>
                                                )}
                                                {group.customer_phone && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3" />{group.customer_phone}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Produktliste-forhåndsvisning */}
                                            <ul className="mt-2 space-y-0.5">
                                                {group.items.map((item) => (
                                                    <li key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Cake className="w-3 h-3 text-primary shrink-0" />
                                                        <span className="truncate">{item.package_name || item.cake_name || '—'}</span>
                                                        {item.delivery_date && (
                                                            <span className="text-primary shrink-0">
                                                                · {new Date(item.delivery_date + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                                            <span className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                {group.total_price.toLocaleString('nb-NO')} kr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
