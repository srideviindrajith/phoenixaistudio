'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    CheckCircle, 
    Timer, 
    RotateCcw,
    X,
    Briefcase,
    TrendingUp,
    Star,
    Layers,
    List,
    FileText,
    HelpCircle,
    Eye,
    PlusCircle
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';
import { AIBrandingGenerator } from '@/components/admin/ai-branding-generator';
import { ModuleToggle } from '@/components/admin/module-toggle';

interface ServiceAddon {
    title: string;
    price: string;
}

interface ServiceFaq {
    q: string;
    a: string;
}

interface CoverLetterServiceItem {
    id: string;
    title: string;
    category: string;
    package: string;
    price: string;
    discount: string;
    delivery: string;
    revisions: string;
    support: string;
    status: 'Active' | 'Inactive';
    visibility: 'Public' | 'Internal Only';
    featured: boolean;
    popular: boolean;
    desc: string;
    features: string[];
    deliverables: string[];
    faqs: ServiceFaq[];
    requirements: string[];
    instructions: string[];
    addons: ServiceAddon[];
}

export default function CoverLetterServicesPage() {
    const [services, setServices] = useState<CoverLetterServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [packageFilter, setPackageFilter] = useState('All');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSvc, setEditingSvc] = useState<CoverLetterServiceItem | null>(null);

    // List inputs in Modal
    const [featureInput, setFeatureInput] = useState('');
    const [deliverableInput, setDeliverableInput] = useState('');
    const [requirementInput, setRequirementInput] = useState('');
    const [instructionInput, setInstructionInput] = useState('');
    
    const [faqQInput, setFaqQInput] = useState('');
    const [faqAInput, setFaqAInput] = useState('');

    const [addonTitleInput, setAddonTitleInput] = useState('');
    const [addonPriceInput, setAddonPriceInput] = useState('');

    const [generatedBranding, setGeneratedBranding] = useState<any>(null);

    const [formState, setFormState] = useState<{
        title: string;
        category: string;
        package: string;
        price: string;
        discount: string;
        delivery: string;
        revisions: string;
        support: string;
        status: 'Active' | 'Inactive';
        visibility: 'Public' | 'Internal Only';
        featured: boolean;
        popular: boolean;
        desc: string;
        features: string[];
        deliverables: string[];
        faqs: ServiceFaq[];
        requirements: string[];
        instructions: string[];
        addons: ServiceAddon[];
    }>({
        title: '',
        category: 'Writing',
        package: 'Starter',
        price: '₹1,999',
        discount: '0%',
        delivery: '3 Business Days',
        revisions: '2 Rounds',
        support: 'Email Support',
        status: 'Active',
        visibility: 'Public',
        featured: false,
        popular: false,
        desc: '',
        features: [],
        deliverables: [],
        faqs: [],
        requirements: [],
        instructions: [],
        addons: []
    });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cover-letter-services');
            const data = await res.json();
            if (data.success) {
                setServices(data.services || []);
                if (data.services && data.services.length > 0) {
                    setSelectedId(data.services[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching cover letter services:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...formState,
            id: editingSvc?.id || undefined
        };

        try {
            const res = await fetch('/api/cover-letter-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                if (editingSvc) {
                    setServices(prev => prev.map(s => s.id === data.service.id ? data.service : s));
                } else {
                    setServices(prev => [data.service, ...prev]);
                    setSelectedId(data.service.id);
                }
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving cover letter service:', error);
        }
    };

    const handleDuplicate = async (svc: CoverLetterServiceItem) => {
        const confirmMsg = `Duplicate service "${svc.title}"?`;
        if (!confirm(confirmMsg)) return;

        const duplicated = {
            ...svc,
            id: `svc-cl-${Math.floor(1000 + Math.random() * 9000)}`,
            title: `${svc.title} (Copy)`,
            status: 'Inactive' as const
        };

        try {
            const res = await fetch('/api/cover-letter-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duplicated)
            });
            const data = await res.json();
            if (data.success) {
                setServices(prev => [data.service, ...prev]);
                setSelectedId(data.service.id);
            }
        } catch (error) {
            console.error('Error duplicating service:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const res = await fetch(`/api/cover-letter-services?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setServices(prev => prev.filter(s => s.id !== id));
                if (selectedId === id) {
                    setSelectedId(null);
                }
            }
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const openAddModal = () => {
        setEditingSvc(null);
        setFormState({
            title: '',
            category: 'Writing',
            package: 'Starter',
            price: '₹1,999',
            discount: '0%',
            delivery: '3 Business Days',
            revisions: '2 Rounds',
            support: 'Email Support',
            status: 'Active',
            visibility: 'Public',
            featured: false,
            popular: false,
            desc: '',
            features: [],
            deliverables: [],
            faqs: [],
            requirements: [],
            instructions: [],
            addons: []
        });
        // Clear list inputs
        setFeatureInput('');
        setDeliverableInput('');
        setRequirementInput('');
        setInstructionInput('');
        setFaqQInput('');
        setFaqAInput('');
        setAddonTitleInput('');
        setAddonPriceInput('');
        setIsModalOpen(true);
    };

    const openEditModal = (svc: CoverLetterServiceItem) => {
        setEditingSvc(svc);
        setFormState({
            title: svc.title,
            category: svc.category,
            package: svc.package,
            price: svc.price,
            discount: svc.discount,
            delivery: svc.delivery,
            revisions: svc.revisions,
            support: svc.support,
            status: svc.status,
            visibility: svc.visibility,
            featured: svc.featured,
            popular: svc.popular,
            desc: svc.desc,
            features: svc.features || [],
            deliverables: svc.deliverables || [],
            faqs: svc.faqs || [],
            requirements: svc.requirements || [],
            instructions: svc.instructions || [],
            addons: svc.addons || []
        });
        // Clear list inputs
        setFeatureInput('');
        setDeliverableInput('');
        setRequirementInput('');
        setInstructionInput('');
        setFaqQInput('');
        setFaqAInput('');
        setAddonTitleInput('');
        setAddonPriceInput('');
        setIsModalOpen(true);
    };

    // Filter Logic
    const filteredServices = services.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        const matchesPackage = packageFilter === 'All' || s.package === packageFilter;
        return matchesSearch && matchesStatus && matchesPackage;
    });

    const stats = [
        { title: 'Total Services', value: services.length, icon: Briefcase },
        { title: 'Active Services', value: services.filter(s => s.status === 'Active').length, icon: CheckCircle },
        { title: 'Average Value', value: '₹2,165', icon: TrendingUp }
    ];

    const selectedService = services.find(s => s.id === selectedId) || null;

    // Helper functions to push to array inside state
    const pushFeature = () => {
        if (!featureInput.trim()) return;
        setFormState(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
        setFeatureInput('');
    };

    const removeFeature = (idx: number) => {
        setFormState(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
    };

    const pushDeliverable = () => {
        if (!deliverableInput.trim()) return;
        setFormState(prev => ({ ...prev, deliverables: [...prev.deliverables, deliverableInput.trim()] }));
        setDeliverableInput('');
    };

    const removeDeliverable = (idx: number) => {
        setFormState(prev => ({ ...prev, deliverables: prev.deliverables.filter((_, i) => i !== idx) }));
    };

    const pushRequirement = () => {
        if (!requirementInput.trim()) return;
        setFormState(prev => ({ ...prev, requirements: [...prev.requirements, requirementInput.trim()] }));
        setRequirementInput('');
    };

    const removeRequirement = (idx: number) => {
        setFormState(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
    };

    const pushInstruction = () => {
        if (!instructionInput.trim()) return;
        setFormState(prev => ({ ...prev, instructions: [...prev.instructions, instructionInput.trim()] }));
        setInstructionInput('');
    };

    const removeInstruction = (idx: number) => {
        setFormState(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== idx) }));
    };

    const pushFaq = () => {
        if (!faqQInput.trim() || !faqAInput.trim()) return;
        setFormState(prev => ({
            ...prev,
            faqs: [...prev.faqs, { q: faqQInput.trim(), a: faqAInput.trim() }]
        }));
        setFaqQInput('');
        setFaqAInput('');
    };

    const removeFaq = (idx: number) => {
        setFormState(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }));
    };

    const pushAddon = () => {
        if (!addonTitleInput.trim() || !addonPriceInput.trim()) return;
        setFormState(prev => ({
            ...prev,
            addons: [...prev.addons, { title: addonTitleInput.trim(), price: addonPriceInput.trim() }]
        }));
        setAddonTitleInput('');
        setAddonPriceInput('');
    };

    const removeAddon = (idx: number) => {
        setFormState(prev => ({ ...prev, addons: prev.addons.filter((_, i) => i !== idx) }));
    };

    return (
        <div className="max-w-7xl space-y-6 lg:space-y-8 select-none text-white animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Cover Letter Services</h1>
                <p className="text-gray-400 text-sm mt-1">Configure packaging configurations, discount values, SLA delivery parameters, and guidelines.</p>
            </div>

            {/* Module Toggle */}
            <div>
                <ModuleToggle moduleKey="cover-letter-services" moduleName="Cover Letter Services" />
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
                            placeholder="Search Cover Letter Services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00]/50"
                        />
                    </div>
                    <select 
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="h-11 px-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] text-xs text-zinc-400 focus:outline-none focus:border-[#FF7A00]/50 appearance-none cursor-pointer min-w-[140px]"
                    >
                        <option value="All">All Packages</option>
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>
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
                    <span>Create Service Option</span>
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
                                    <th className="p-4 pl-6">Service Name</th>
                                    <th className="p-4">Package</th>
                                    <th className="p-4">Price / Discount</th>
                                    <th className="p-4">Delivery SLA</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-500">
                                            <div className="w-6 h-6 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin mx-auto mb-2" />
                                            Loading services...
                                        </td>
                                    </tr>
                                ) : filteredServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-zinc-500">
                                            No services found. Click Create Service Option to add one.
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
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white">{row.title}</p>
                                                        {row.featured && (
                                                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[7px] font-bold px-1 rounded">FEATURED</span>
                                                        )}
                                                        {row.popular && (
                                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[7px] font-bold px-1 rounded">POPULAR</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 max-w-[280px] truncate">{row.desc}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    {row.package}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[#FF8A33] font-bold">{row.price}</span>
                                                    {row.discount && row.discount !== '0%' && (
                                                        <span className="text-[8px] text-green-400">-{row.discount} Off</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-zinc-400">{row.delivery}</td>
                                            <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleDuplicate(row)}
                                                        title="Duplicate"
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <Layers className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(row)}
                                                        title="Edit"
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        title="Delete"
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
                                <h4 className="text-lg font-bold text-white leading-tight">{selectedService.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A00]">
                                        Price: {selectedService.price}
                                    </span>
                                    {selectedService.discount && selectedService.discount !== '0%' && (
                                        <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-bold">
                                            {selectedService.discount} Discount
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {selectedService.desc}
                            </p>

                            <div className="grid grid-cols-2 gap-y-3.5 border-t border-white/5 pt-4 text-zinc-300">
                                <div className="space-y-1">
                                    <span className="text-zinc-500 text-[9px] uppercase font-bold block">Category</span>
                                    <span className="font-semibold text-white">{selectedService.category}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-zinc-500 text-[9px] uppercase font-bold block">Package Tier</span>
                                    <span className="font-semibold text-white">{selectedService.package}</span>
                                </div>
                                <div className="space-y-1 flex items-center gap-1.5 mt-2 col-span-2">
                                    <Timer className="w-4 h-4 text-[#FF7A00]" />
                                    <div>
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold block">Delivery Time</span>
                                        <span className="font-semibold text-white">{selectedService.delivery}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 flex items-center gap-1.5 mt-2 col-span-2">
                                    <RotateCcw className="w-4 h-4 text-[#FF7A00]" />
                                    <div>
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold block">Revisions SLA</span>
                                        <span className="font-semibold text-white">{selectedService.revisions}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 flex items-center gap-1.5 mt-2 col-span-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <div>
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold block">Support Channels</span>
                                        <span className="font-semibold text-white">{selectedService.support}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Rich Arrays Section */}
                            <div className="space-y-4 border-t border-white/5 pt-4">
                                {/* Features */}
                                {selectedService.features && selectedService.features.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold flex items-center gap-1"><List className="w-3 h-3 text-[#FF7A00]" /> Service Features</span>
                                        <ul className="list-disc list-inside text-zinc-400 space-y-1 pl-1">
                                            {selectedService.features.map((f, i) => (
                                                <li key={i}>{f}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Deliverables */}
                                {selectedService.deliverables && selectedService.deliverables.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold flex items-center gap-1"><FileText className="w-3 h-3 text-[#FF7A00]" /> Deliverables</span>
                                        <ul className="list-disc list-inside text-zinc-400 space-y-1 pl-1">
                                            {selectedService.deliverables.map((d, i) => (
                                                <li key={i}>{d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* FAQs */}
                                {selectedService.faqs && selectedService.faqs.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-[#FF7A00]" /> FAQs</span>
                                        <div className="space-y-2 pl-1">
                                            {selectedService.faqs.map((faq, i) => (
                                                <div key={i} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                                                    <p className="font-bold text-white">Q: {faq.q}</p>
                                                    <p className="text-zinc-400 mt-0.5">A: {faq.a}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Addons */}
                                {selectedService.addons && selectedService.addons.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-zinc-500 text-[9px] uppercase font-bold flex items-center gap-1"><PlusCircle className="w-3 h-3 text-[#FF7A00]" /> Available Add-ons</span>
                                        <div className="space-y-1 pl-1">
                                            {selectedService.addons.map((ad, i) => (
                                                <div key={i} className="flex justify-between items-center text-zinc-300">
                                                    <span>{ad.title}</span>
                                                    <span className="font-bold text-[#FF8A33]">{ad.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500">Select a service item to inspect specifications.</p>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative w-full max-w-2xl bg-[#0c0c0c]/95 border border-white/10 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl z-10 animate-fade-in-scale overflow-hidden">
                        <div className="flex justify-between items-center border-b border-white/5 p-6 pb-4">
                            <h3 className="text-lg font-bold text-white font-heading">
                                {editingSvc ? 'Edit Cover Letter Service' : 'Create Cover Letter Service'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden text-xs text-zinc-300">
                            {/* Scrollable inputs content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* Core Metadata */}
                                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4">
                                    <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
                                        Core Service Specifications
                                    </h4>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Service Title <span className="text-[#FF7A00]">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formState.title}
                                            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Professional Cover Letter Writing"
                                            className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Category</label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.category}
                                                onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                                                placeholder="e.g. Writing, Review"
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Package Tier</label>
                                            <select
                                                value={formState.package}
                                                onChange={(e) => setFormState(prev => ({ ...prev, package: e.target.value }))}
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-[#FF7A00]"
                                            >
                                                <option value="Starter">Starter</option>
                                                <option value="Professional">Professional</option>
                                                <option value="Enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Price <span className="text-[#FF7A00]">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.price}
                                                onChange={(e) => setFormState(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="e.g. ₹1,999"
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Discount Percentage</label>
                                            <input
                                                type="text"
                                                value={formState.discount}
                                                onChange={(e) => setFormState(prev => ({ ...prev, discount: e.target.value }))}
                                                placeholder="e.g. 15%"
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Delivery Time SLA</label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.delivery}
                                                onChange={(e) => setFormState(prev => ({ ...prev, delivery: e.target.value }))}
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Revisions SLA</label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.revisions}
                                                onChange={(e) => setFormState(prev => ({ ...prev, revisions: e.target.value }))}
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Support Level</label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.support}
                                                onChange={(e) => setFormState(prev => ({ ...prev, support: e.target.value }))}
                                                placeholder="e.g. 24/7 Priority Support"
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Status & Visibility</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                value={formState.status}
                                                onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as any }))}
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white text-xs"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                            <select
                                                value={formState.visibility}
                                                onChange={(e) => setFormState(prev => ({ ...prev, visibility: e.target.value as any }))}
                                                className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-black text-white text-xs"
                                            >
                                                <option value="Public">Public</option>
                                                <option value="Internal Only">Internal Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div onClick={() => setFormState(prev => ({ ...prev, featured: !prev.featured }))} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${formState.featured ? 'border-[#FF7A00]/50 bg-[#FF7A00]/5' : 'border-white/[0.04] bg-black/20'}`}>
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${formState.featured ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-white/20'}`}>
                                                {formState.featured && <span className="text-[9px] text-white">✓</span>}
                                            </div>
                                            <span className="text-zinc-300 font-semibold text-[10px] uppercase">Featured Service</span>
                                        </div>
                                        <div onClick={() => setFormState(prev => ({ ...prev, popular: !prev.popular }))} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${formState.popular ? 'border-[#FF7A00]/50 bg-[#FF7A00]/5' : 'border-white/[0.04] bg-black/20'}`}>
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${formState.popular ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-white/20'}`}>
                                                {formState.popular && <span className="text-[9px] text-white">✓</span>}
                                            </div>
                                            <span className="text-zinc-300 font-semibold text-[10px] uppercase">Popular Choice</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Description <span className="text-[#FF7A00]">*</span></label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={formState.desc}
                                            onChange={(e) => setFormState(prev => ({ ...prev, desc: e.target.value }))}
                                            className="w-full p-4 rounded-xl border border-white/[0.08] bg-black text-white resize-none"
                                        />
                                    </div>
                                </div>

                                {/* AI Branding Generator Section */}
                                <AIBrandingGenerator
                                    serviceName={formState.title}
                                    category={formState.category}
                                    description={formState.desc}
                                    onBrandingGenerated={setGeneratedBranding}
                                />

                                {/* Rich Input Arrays - Features & Deliverables */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Features */}
                                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Features List</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a feature..." className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushFeature} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                            {formState.features.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 pl-2.5 rounded-lg border border-white/[0.04]">
                                                    <span className="text-[10px] truncate max-w-[200px]">{item}</span>
                                                    <button type="button" onClick={() => removeFeature(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deliverables */}
                                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Deliverables List</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={deliverableInput} onChange={(e) => setDeliverableInput(e.target.value)} placeholder="Add deliverable..." className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushDeliverable} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                            {formState.deliverables.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 pl-2.5 rounded-lg border border-white/[0.04]">
                                                    <span className="text-[10px] truncate max-w-[200px]">{item}</span>
                                                    <button type="button" onClick={() => removeDeliverable(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* FAQs Section */}
                                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Frequently Asked Questions (FAQs)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" value={faqQInput} onChange={(e) => setFaqQInput(e.target.value)} placeholder="Question..." className="h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                        <div className="flex gap-2">
                                            <input type="text" value={faqAInput} onChange={(e) => setFaqAInput(e.target.value)} placeholder="Answer..." className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushFaq} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                                        {formState.faqs.map((faq, idx) => (
                                            <div key={idx} className="flex justify-between items-start bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] gap-2">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-white">Q: {faq.q}</p>
                                                    <p className="text-zinc-400 text-[10px]">A: {faq.a}</p>
                                                </div>
                                                <button type="button" onClick={() => removeFaq(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Requirements & Instructions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Requirements */}
                                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Submission Requirements</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={requirementInput} onChange={(e) => setRequirementInput(e.target.value)} placeholder="Add requirement..." className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushRequirement} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                            {formState.requirements.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 pl-2.5 rounded-lg border border-white/[0.04]">
                                                    <span className="text-[10px] truncate max-w-[200px]">{item}</span>
                                                    <button type="button" onClick={() => removeRequirement(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Process Instructions</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={instructionInput} onChange={(e) => setInstructionInput(e.target.value)} placeholder="Add step instruction..." className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushInstruction} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                            {formState.instructions.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 pl-2.5 rounded-lg border border-white/[0.04]">
                                                    <span className="text-[10px] truncate max-w-[200px]">{item}</span>
                                                    <button type="button" onClick={() => removeInstruction(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Add-ons Section */}
                                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Service Add-ons</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" value={addonTitleInput} onChange={(e) => setAddonTitleInput(e.target.value)} placeholder="Add-on Name..." className="h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                        <div className="flex gap-2">
                                            <input type="text" value={addonPriceInput} onChange={(e) => setAddonPriceInput(e.target.value)} placeholder="e.g. ₹599" className="flex-1 h-9 px-3 rounded-lg border border-white/[0.08] bg-black text-white text-xs" />
                                            <button type="button" onClick={pushAddon} className="px-3 h-9 rounded-lg bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF8A33]">Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                                        {formState.addons.map((ad, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-1.5 px-3 rounded-lg border border-white/[0.04]">
                                                <span>{ad.title}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-[#FF8A33]">{ad.price}</span>
                                                    <button type="button" onClick={() => removeAddon(idx)} className="text-zinc-500 hover:text-red-400 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 justify-end border-t border-white/5 p-6 pt-4 bg-[#0a0a0a]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 h-11 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-white font-semibold cursor-pointer">Save Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
