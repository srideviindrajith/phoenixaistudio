'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    ArrowUpDown, 
    CheckCircle2, 
    Timer, 
    RotateCcw,
    X,
    Globe,
    TrendingUp,
    Star
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';
import { AIBrandingGenerator } from '@/components/admin/ai-branding-generator';
import { ModuleToggle } from '@/components/admin/module-toggle';

interface PortfolioServiceItem {
    id: string;
    title: string;
    desc: string;
    price: string;
    bestFor: string;
    delivery: string;
    revisions: string;
    status: 'Active' | 'Inactive';
}

export default function PortfolioServicesCRUD() {
    const [services, setServices] = useState<PortfolioServiceItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchServices = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/portfolio-services')
            const data = await res.json()
            setServices(data.services || [])
        } catch (error) {
            console.error('Error fetching portfolio services:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSvc, setEditingSvc] = useState<PortfolioServiceItem | null>(null);
    const [generatedBranding, setGeneratedBranding] = useState<any>(null);
    const [formState, setFormState] = useState({
        title: '',
        desc: '',
        price: '₹2,999',
        bestFor: '',
        delivery: '4-5 Business Days',
        revisions: 'Unlimited for 30 days',
        status: 'Active' as 'Active' | 'Inactive'
    });

    const stats = [
        { title: 'Total Services', value: services.length, icon: Globe },
        { title: 'Active Services', value: services.filter(s => s.status === 'Active').length, icon: CheckCircle2 },
        { title: 'Average Cost', value: '₹3,599', icon: TrendingUp }
    ];

    const selectedService = services.find(s => s.id === selectedId) || null;

    // Filters
    const filteredServices = services.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSvc) {
            setServices(prev => prev.map(s => s.id === editingSvc.id ? { ...s, ...formState } : s));
        } else {
            const newItem: PortfolioServiceItem = {
                id: (services.length + 1).toString(),
                ...formState
            };
            setServices(prev => [...prev, newItem]);
            setSelectedId(newItem.id);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            setServices(prev => prev.filter(s => s.id !== id));
            if (selectedId === id) {
                setSelectedId(null);
            }
        }
    };

    const openAddModal = () => {
        setEditingSvc(null);
        setFormState({
            title: '',
            desc: '',
            price: '₹2,999',
            bestFor: '',
            delivery: '4-5 Business Days',
            revisions: 'Unlimited for 30 days',
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (svc: PortfolioServiceItem) => {
        setEditingSvc(svc);
        setFormState({
            title: svc.title,
            desc: svc.desc,
            price: svc.price,
            bestFor: svc.bestFor,
            delivery: svc.delivery,
            revisions: svc.revisions,
            status: svc.status
        });
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl space-y-6 lg:space-y-8 select-none text-white animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Portfolio Services Manager</h1>
                <p className="text-gray-400 text-sm mt-1">Configure pricing tiers, SLA deliveries, and description copy for Portfolio Services.</p>
            </div>

            {/* Module Toggle */}
            <div>
                <ModuleToggle moduleKey="portfolio-services" moduleName="Portfolio Services" />
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, idx) => (
                    <StatsCard
                        key={idx}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                    />
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-4xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search Services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00]/50"
                        />
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] text-xs text-zinc-400 focus:outline-none focus:border-[#FF7A00]/50 appearance-none cursor-pointer min-w-[140px]"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <button
                    onClick={openAddModal}
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(255,122,0,0.35)]"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Service Option</span>
                </button>
            </div>

            {/* Content Table / Detail Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Data Table */}
                <div className="phoenix-table-wrap lg:col-span-2 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="p-4 pl-6">Service</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Delivery SLA</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                {filteredServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-500">
                                            No services found. Click Add to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredServices.map((row) => (
                                        <tr 
                                            key={row.id} 
                                            onClick={() => setSelectedId(row.id)}
                                            className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${
                                                selectedId === row.id ? 'bg-[#FF7A00]/5' : ''
                                            }`}
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-white">{row.title}</p>
                                                    <p className="text-[10px] text-zinc-500 max-w-[280px] truncate">{row.desc}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-[#FF8A33] font-bold">{row.price}</td>
                                            <td className="p-4 text-zinc-400">{row.delivery}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                                    row.status === 'Active' 
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => openEditModal(row)}
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail View */}
                <div className="phoenix-table-wrap p-6 space-y-6">
                    <h3 className="font-heading text-md font-bold text-white border-b border-white/5 pb-3">
                        Service Details
                    </h3>

                    {selectedService ? (
                        <div className="space-y-6 animate-fade-in text-xs">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-white">{selectedService.title}</h4>
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#FF7A00]">
                                    Starting Price: {selectedService.price}
                                </span>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {selectedService.desc}
                            </p>

                            <div className="space-y-3.5 border-t border-white/5 pt-4 text-zinc-300">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Best For</span>
                                    <span className="font-semibold text-right max-w-[160px]">{selectedService.bestFor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Delivery SLA</span>
                                    <span className="font-semibold">{selectedService.delivery}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Revisions</span>
                                    <span className="font-semibold">{selectedService.revisions}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500">Select a service item to inspect specs.</p>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 animate-fade-in-scale">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-white">
                                {editingSvc ? 'Edit Service' : 'Add Service Option'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs text-zinc-300">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Service Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formState.title}
                                    onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Developer Portfolio"
                                    className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Starting Price</label>
                                    <input
                                        type="text"
                                        required
                                        value={formState.price}
                                        onChange={(e) => setFormState(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="e.g. ₹2,999"
                                        className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Status</label>
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                                        className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Delivery SLA</label>
                                    <input
                                        type="text"
                                        required
                                        value={formState.delivery}
                                        onChange={(e) => setFormState(prev => ({ ...prev, delivery: e.target.value }))}
                                        className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Revisions</label>
                                    <input
                                        type="text"
                                        required
                                        value={formState.revisions}
                                        onChange={(e) => setFormState(prev => ({ ...prev, revisions: e.target.value }))}
                                        className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Best For</label>
                                <input
                                    type="text"
                                    required
                                    value={formState.bestFor}
                                    onChange={(e) => setFormState(prev => ({ ...prev, bestFor: e.target.value }))}
                                    placeholder="e.g. Designers, creators, freelancers"
                                    className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    value={formState.desc}
                                    onChange={(e) => setFormState(prev => ({ ...prev, desc: e.target.value }))}
                                    className="w-full p-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00] resize-none"
                                />
                            </div>

                            {/* AI Branding Generator Section */}
                            <AIBrandingGenerator
                                serviceName={formState.title}
                                category="Portfolio"
                                description={formState.desc}
                                onBrandingGenerated={setGeneratedBranding}
                            />

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 h-11 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-white font-semibold cursor-pointer"
                                >
                                    Save Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
