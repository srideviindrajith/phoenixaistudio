import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { 
    ChevronRight, 
    Sparkles, 
    ArrowRight,
    Code,
    Palette,
    Laptop,
    Building2,
    Rocket,
    Globe,
    CheckCircle2,
    Timer,
    RotateCcw,
    Monitor
} from 'lucide-react';

export default function PortfolioServicesPage() {
    const services = [
        {
            icon: Code,
            title: 'Developer Portfolio',
            desc: 'Sleek portfolio showcasing active repositories, tech stacks, and live application deployment links.',
            price: 'Starting at ₹2,999',
            bestFor: 'Software developers, cloud engineers',
            delivery: '4-5 Business Days',
            revisions: 'Unlimited for 30 days',
            responsive: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Palette,
            title: 'UI/UX Portfolio',
            desc: 'Immersive layouts presenting case studies, wireframes, and prototypes with fluid animations.',
            price: 'Starting at ₹3,499',
            bestFor: 'Product designers, UI/UX engineers',
            delivery: '4-5 Business Days',
            revisions: 'Unlimited for 30 days',
            responsive: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Laptop,
            title: 'Freelancer Portfolio',
            desc: 'Tailored to demonstrate client work history, credentials, services, rate cards, and reviews.',
            price: 'Starting at ₹2,499',
            bestFor: 'Contractors, consultants, creators',
            delivery: '3-4 Business Days',
            revisions: 'Unlimited for 14 days',
            responsive: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Building2,
            title: 'Business Portfolio',
            desc: 'Perfect for showing sales achievements, analytics dashboards, and operations metrics.',
            price: 'Starting at ₹3,999',
            bestFor: 'Consultancies, agencies, businesses',
            delivery: '5-6 Business Days',
            revisions: 'Unlimited for 45 days',
            responsive: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Rocket,
            title: 'Agency Portfolio',
            desc: 'Optimized to display group services, client reviews, and case study milestones.',
            price: 'Starting at ₹4,999',
            bestFor: 'Startups, studios, design agencies',
            delivery: '5-6 Business Days',
            revisions: 'Unlimited for 45 days',
            responsive: 'Yes',
            writing: 'Yes'
        }
    ];

    const features = [
        { icon: Monitor, title: 'Responsive Layouts', desc: 'Interfaces rendered beautifully on mobile, tablet, and widescreen viewports.' },
        { icon: Sparkles, title: 'Fluid Transitions', desc: 'Pre-configured hover states and interactive scrolling visuals.' },
        { icon: Globe, title: 'Custom Domain Ready', desc: 'Simple options to link your custom hostname with secure HTTPS.' },
        { icon: CheckCircle2, title: 'SEO Optimized', desc: 'Precompiled metadata schemas matching industry indexing structures.' }
    ];

    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black select-none text-white min-h-screen">
                {/* Ambient glows */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,122,0,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,106,0,0.03),transparent_40%)]" />
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
                        <span className="text-[#FF7A00]">Portfolio Services</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="text-center py-16 md:py-20 max-w-3xl mx-auto space-y-6 animate-fade-in-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] tracking-wider uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>Premium Development Services</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-none">
                            Expert Portfolio <span className="gradient-text">Design</span>
                        </h1>
                        <p className="text-md sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Spotlight your projects and client proof-of-work. Our team builds and deploys your custom personal web portfolios.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="#services-list"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5 cursor-pointer"
                            >
                                <span>Explore Services</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section id="services-list" className="py-16 space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
                                Our Development <span className="gradient-text">Solutions</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Browse custom web design configurations built specifically to present your career milestones.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((svc, idx) => (
                                <div key={idx} className="phoenix-card p-6 flex flex-col justify-between items-start space-y-6 relative border border-white/[0.04]">
                                    <div className="space-y-4 w-full">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] inline-block">
                                                <svc.icon className="w-6 h-6 text-[#FF7A00]" />
                                            </div>
                                            <span className="text-sm font-bold text-white tracking-wide mt-2">
                                                {svc.price}
                                            </span>
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
                                                <span className="text-zinc-500">Best For</span>
                                                <span className="font-semibold text-right max-w-[160px] truncate">{svc.bestFor}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-zinc-500 flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Delivery</span>
                                                <span className="font-semibold">{svc.delivery}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-zinc-500 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Revisions</span>
                                                <span className="font-semibold">{svc.revisions}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Responsive Layout</span>
                                                <span className="font-semibold text-[#FF8A33]">{svc.responsive}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Expert Developer</span>
                                                <span className="font-semibold text-green-400">{svc.writing}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Link
                                        href="/packages?category=Career Builder"
                                        className="w-full h-11 rounded-lg bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-xs font-semibold text-white flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(255,122,0,0.3)] cursor-pointer text-center"
                                    >
                                        View Packages
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="py-16 space-y-12 border-t border-white/[0.06]">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
                                Technical <span className="gradient-text">Highlights</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Clean layouts pre-configured for indexing visibility, responsiveness, and speed.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feat, idx) => (
                                <div key={idx} className="phoenix-card p-6 flex flex-col items-start gap-4 border border-white/[0.04]">
                                    <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33]">
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
