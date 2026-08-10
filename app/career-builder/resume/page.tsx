import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { 
    ChevronRight, 
    Sparkles, 
    ArrowRight,
    GraduationCap,
    Award,
    Code,
    Cpu,
    Building2,
    Briefcase,
    Globe,
    CheckCircle2,
    Timer,
    RotateCcw
} from 'lucide-react';

export default function ResumeServicesPage() {
    const services = [
        {
            icon: GraduationCap,
            title: 'Fresher Resume',
            desc: 'Designed for entry-level jobs and recent graduates, focusing on skills, internships, and projects.',
            price: '₹1,499',
            bestFor: 'Entry-level roles, internships',
            delivery: '2-3 Business Days',
            revisions: 'Unlimited for 14 days',
            ats: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Award,
            title: 'Experienced Resume',
            desc: 'Tailored for mid-level professionals to showcase career growth, leadership skills, and achievements.',
            price: '₹2,499',
            bestFor: '2-8 years of experience',
            delivery: '3-4 Business Days',
            revisions: 'Unlimited for 30 days',
            ats: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Cpu,
            title: 'ATS Optimized Resume',
            desc: 'Engineered specifically to bypass corporate applicant tracking system filters cleanly.',
            price: '₹1,999',
            bestFor: 'Corporate applications, competitive roles',
            delivery: '2-3 Business Days',
            revisions: 'Unlimited for 14 days',
            ats: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Code,
            title: 'Software Developer Resume',
            desc: 'Structured for technical profiles highlighting developer repositories, tech stacks, and certifications.',
            price: '₹2,999',
            bestFor: 'Engineers, Architects, Tech Leads',
            delivery: '3-4 Business Days',
            revisions: 'Unlimited for 30 days',
            ats: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Briefcase,
            title: 'Executive Resume',
            desc: 'High-impact layout custom-written for senior managers, VP levels, directors, and executives.',
            price: '₹4,999',
            bestFor: '8+ years of experience, VP, Director, C-Suite',
            delivery: '4-5 Business Days',
            revisions: 'Unlimited for 60 days',
            ats: 'Yes',
            writing: 'Yes'
        },
        {
            icon: Globe,
            title: 'International Resume',
            desc: 'Tailored CV formatting compliant with global job markets and immigration/sponsorship criteria.',
            price: '₹3,999',
            bestFor: 'Overseas applications, multinational roles',
            delivery: '4-5 Business Days',
            revisions: 'Unlimited for 45 days',
            ats: 'Yes',
            writing: 'Yes'
        }
    ];

    const features = [
        { icon: CheckCircle2, title: 'ATS Optimized', desc: 'Compliant layouts that pass standard applicant systems.' },
        { icon: Sparkles, title: 'AI Assisted', desc: 'Keyword matching and bullet points optimized with PhoenixAI diagnostics.' },
        { icon: Briefcase, title: 'Expert Consultation', desc: 'Direct review session with senior HR copywriters.' },
        { icon: Globe, title: 'Global Standards', desc: 'Formats engineered to meet US, European, and Gulf region standards.' }
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
                        <span className="text-[#FF7A00]">Resume Services</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="text-center py-16 md:py-20 max-w-3xl mx-auto space-y-6 animate-fade-in-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] tracking-wider uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>Professional Writing Services</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-none">
                            Expert Resume <span className="gradient-text">Writing</span>
                        </h1>
                        <p className="text-md sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Stand out to hiring managers. Our team of professional HR writers custom-builds your high-impact, ATS-optimized resume.
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
                                Our Writing <span className="gradient-text">Solutions</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Choose from our specialized writing options tailored for every stage of your career.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                <span className="text-zinc-500">ATS Friendly</span>
                                                <span className="font-semibold text-[#FF8A33]">{svc.ats}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Expert Writer</span>
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
                                Professional <span className="gradient-text">Benefits</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Every asset is engineered by expert human copywriters and backed by visual diagnostics.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feat, idx) => (
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
