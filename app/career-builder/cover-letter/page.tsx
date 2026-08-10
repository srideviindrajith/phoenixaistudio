'use client';

import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
    ChevronRight, 
    Sparkles, 
    ArrowRight,
    PenTool,
    CheckCircle2,
    Timer,
    RotateCcw,
    FileText,
    HelpCircle,
    PlusCircle,
    Inbox
} from 'lucide-react';

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

export default function CoverLetterServicesPublicPage() {
    const [services, setServices] = useState<CoverLetterServiceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadServices = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/cover-letter-services');
                const data = await res.json();
                if (data.success) {
                    // Show ONLY Published, Public, Active records
                    const publicActive = (data.services || []).filter(
                        (s: CoverLetterServiceItem) => s.status === 'Active' && s.visibility === 'Public'
                    );
                    setServices(publicActive);
                }
            } catch (err) {
                console.error('Error loading cover letter services:', err);
            } finally {
                setLoading(false);
            }
        };
        loadServices();
    }, []);

    const featuresSummary = [
        { icon: CheckCircle2, title: 'ATS Optimized', desc: 'Compliant layouts that integrate target resume keywords.' },
        { icon: Sparkles, title: 'Tailored Hook', desc: 'AI-assisted hooks matching company specific vision items.' },
        { icon: PenTool, title: 'Expert Writers', desc: 'Direct narrative construction by recruitment copywriters.' },
        { icon: FileText, title: 'Source Formats', desc: 'Clean editable outputs provided in Word docx and print ready PDF.' }
    ];

    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black select-none text-white min-h-screen">
                {/* Ambient lights */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,122,0,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(255,106,0,0.03),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,122,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,122,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-8 pb-20">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-12 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <Link href="/" className="hover:text-[#FF8A33] transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                        <Link href="/career-builder" className="hover:text-[#FF8A33] transition-colors">
                            Career Builder
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[#FF7A00]">Cover Letter Services</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="text-center py-16 md:py-20 max-w-3xl mx-auto space-y-6 animate-fade-in-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] tracking-wider uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>Professional Writing Solutions</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-none">
                            Expert Cover Letter <span className="gradient-text">Writing</span>
                        </h1>
                        <p className="text-md sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Hook hiring managers from the first sentence. Our professional writers custom-build tailored cover letters for your target positions.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="#services-list"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5 cursor-pointer"
                            >
                                <span>Explore Packages</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section id="services-list" className="py-16 space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
                                Our Cover Letter <span className="gradient-text">Options</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Choose from our specialized reviews and comprehensive writing packages.
                            </p>
                        </div>

                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-zinc-500 text-xs">Fetching active service tiers...</p>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="p-16 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center text-zinc-500 text-xs max-w-lg mx-auto space-y-3">
                                <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
                                <p>No cover letter services are currently active. Please check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {services.map((svc) => (
                                    <div key={svc.id} className="phoenix-card p-6 flex flex-col justify-between items-start space-y-6 relative border border-white/[0.04] hover:border-[#FF7A00]/30 transition-all duration-300">
                                        <div className="space-y-4 w-full">
                                            <div className="flex justify-between items-start">
                                                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#FF7A00]/10 text-[#FF8A33] border border-[#FF7A00]/20">
                                                    {svc.package}
                                                </span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-white tracking-wide block">
                                                        {svc.price}
                                                    </span>
                                                    {svc.discount && svc.discount !== '0%' && (
                                                        <span className="text-[9px] text-green-400 font-bold block">-{svc.discount} Off</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-white tracking-wide">
                                                {svc.title}
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed min-h-[48px]">
                                                {svc.desc}
                                            </p>

                                            {/* Service Details Lists */}
                                            <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-zinc-300">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Category</span>
                                                    <span className="font-semibold">{svc.category}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-zinc-500 flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Delivery SLA</span>
                                                    <span className="font-semibold">{svc.delivery}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-zinc-500 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Revisions</span>
                                                    <span className="font-semibold">{svc.revisions}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Support</span>
                                                    <span className="font-semibold text-[#FF8A33]">{svc.support}</span>
                                                </div>
                                            </div>

                                            {/* Nested features list */}
                                            {svc.features && svc.features.length > 0 && (
                                                <div className="pt-3 border-t border-white/[0.04] space-y-1">
                                                    {svc.features.map((feat, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center text-[10px] text-zinc-400">
                                                            <div className="w-1 h-1 rounded-full bg-[#FF7A00]" />
                                                            <span>{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <Link
                                            href="/packages?category=Career Builder"
                                            className="w-full h-11 rounded-lg bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-xs font-semibold text-white flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(255,122,0,0.3)] cursor-pointer text-center"
                                        >
                                            Choose Package
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Features Grid */}
                    <section className="py-16 space-y-12 border-t border-white/[0.06]">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
                                Professional <span className="gradient-text">Benefits</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Every letter matches standard layout conventions ensuring corporate parsing suitability.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuresSummary.map((feat, idx) => (
                                <div key={idx} className="phoenix-card p-6 flex flex-col items-start gap-4 border border-white/[0.04]">
                                    <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] shrink-0">
                                        <feat.icon className="w-5 h-5 text-[#FF7A00]" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-white tracking-wide">
                                            {feat.title}
                                        </h3>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            {feat.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
