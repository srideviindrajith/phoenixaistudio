'use client';

import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
    ChevronRight, 
    Briefcase, 
    ArrowRight, 
    FileText, 
    Globe, 
    PenTool, 
    ClipboardCheck, 
    Cpu, 
    Library,
    CheckCircle2,
    Settings2,
    DownloadCloud,
    Award,
    ShieldCheck,
    LayoutGrid,
    Palette,
    Zap,
    Lock,
    Check,
    Sparkles,
    FileDown
} from 'lucide-react';

function CountUp({ end, suffix = '', duration = 1000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function CountUpFloat({ end, suffix = '', duration = 1000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toFixed(1)}{suffix}</span>;
}

export default function CareerBuilderPage() {
    const [statsData, setStatsData] = useState<{
        totalResumes: number;
        totalPortfolios: number;
        atsSuccessRate: number;
        happyClients: number;
    } | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [moduleStates, setModuleStates] = useState<Record<string, any>>({})
    const [loadingModules, setLoadingModules] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/career-builder/stats');
                const data = await res.json();
                if (data.success) {
                    setStatsData({
                        totalResumes: data.totalResumes,
                        totalPortfolios: data.totalPortfolios,
                        atsSuccessRate: data.atsSuccessRate,
                        happyClients: data.happyClients
                    });
                }
            } catch (err) {
                console.error('Error fetching statistics:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchModuleStates = async () => {
            try {
                const res = await fetch('/api/modules');
                const data = await res.json();
                setModuleStates(data.modules || {});
            } catch (err) {
                console.error('Error fetching module states:', err);
            } finally {
                setLoadingModules(false);
            }
        };
        fetchModuleStates();
    }, []);

    const displayStats = [
        { 
            label: 'Resumes Created', 
            value: statsData?.totalResumes ?? 0, 
            suffix: '+', 
            hasData: statsData ? statsData.totalResumes > 0 : false, 
            isFloat: false 
        },
        { 
            label: 'Portfolios Created', 
            value: statsData?.totalPortfolios ?? 0, 
            suffix: '+', 
            hasData: statsData ? statsData.totalPortfolios > 0 : false, 
            isFloat: false 
        },
        { 
            label: 'ATS Success Rate', 
            value: statsData?.atsSuccessRate ?? 0, 
            suffix: '%', 
            hasData: statsData ? statsData.atsSuccessRate > 0 : false, 
            isFloat: true 
        },
        { 
            label: 'Happy Clients', 
            value: statsData?.happyClients ?? 0, 
            suffix: '+', 
            hasData: statsData ? statsData.happyClients > 0 : false, 
            isFloat: false 
        }
    ];

    const allServices = [
        {
            icon: FileText,
            title: 'Resume Templates',
            description: 'Explore high-scoring layouts engineered to pass applicant tracking systems.',
            href: '/career-builder/resume-templates',
            module: 'resume-templates'
        },
        {
            icon: LayoutGrid,
            title: 'Portfolio Templates',
            description: 'Browse customizable online portfolio designs for developers, creatives, and leads.',
            href: '/career-builder/portfolio-templates',
            module: 'portfolio-templates'
        },
        {
            icon: Library,
            title: 'Cover Letter Templates',
            description: 'Select matching, recruiter-approved formats for your application correspondence.',
            href: '/career-builder/cover-letter-templates',
            module: 'cover-letter-templates'
        },
        {
            icon: PenTool,
            title: 'Resume Services',
            description: 'Get a professional, ATS-optimized resume custom-built by our expert writing team.',
            href: '/career-builder/resume',
            module: 'resume-services'
        },
        {
            icon: Globe,
            title: 'Portfolio Services',
            description: 'Deploy a visually striking web portfolio custom-designed to showcase your projects.',
            href: '/career-builder/portfolio',
            module: 'portfolio-services'
        },
        {
            icon: Sparkles,
            title: 'Cover Letter Services',
            description: 'Get high-impact, tailor-made cover letters aligned with target job specifications.',
            href: '/career-builder/cover-letter',
            module: 'cover-letter-services'
        },
        {
            icon: ClipboardCheck,
            title: 'ATS Resume Analysis',
            description: 'Evaluate your resume compatibility score against enterprise recruiting software rules.',
            href: '/career-builder/ats',
            module: 'ats-analysis'
        },
        {
            icon: Cpu,
            title: 'AI Resume Generator',
            description: 'Receive real-time formatting feedback, action verb replacements, and phrase improvements.',
            href: '/career-builder/review',
            module: 'ai-generator'
        }
    ];

    // Filter services based on module states and parent hierarchy
    const services = allServices.filter(service => {
        if (loadingModules) return true;
        
        // Check if parent Career Builder is enabled
        const careerBuilderModule = moduleStates['career-builder'];
        if (!careerBuilderModule || !careerBuilderModule.publicEnabled) {
            return false;
        }

        // Check if the specific service module is enabled
        if (service.module) {
            const serviceModule = moduleStates[service.module];
            return serviceModule && serviceModule.publicEnabled !== false;
        }

        return true;
    });

    const steps = [
        { step: '01', title: 'Choose Service', desc: 'Select the desired resume or portfolio service card.', icon: CheckCircle2 },
        { step: '02', title: 'Select Package', desc: 'Choose from our professional service package tiers.', icon: Settings2 },
        { step: '03', title: 'Submit Requirements', desc: 'Fill out our brief form detailing your career history.', icon: DownloadCloud },
        { step: '04', title: 'Expert Delivery', desc: 'Our team builds and delivers your custom professional assets.', icon: Award }
    ];

    const features = [
        {
            icon: ShieldCheck,
            title: 'ATS Friendly',
            desc: 'Formatting that parses perfectly through applicant tracking systems.'
        },
        {
            icon: LayoutGrid,
            title: 'Modern Templates',
            desc: 'Contemporary structures optimized for high visual readability.'
        },
        {
            icon: Palette,
            title: 'Professional Designs',
            desc: 'Designed by recruiting experts to highlight key qualifications.'
        },
        {
            icon: Zap,
            title: 'Fast Delivery',
            desc: 'Build polished portfolios and resumes in minutes, not hours.'
        },
        {
            icon: Cpu,
            title: 'AI Powered',
            desc: 'Intelligent phrase re-writing and capability metrics assistance.'
        },
        {
            icon: Lock,
            title: 'Secure Data',
            desc: 'Enterprise-grade encryption protecting your personal credentials.'
        }
    ];



    // Check if Career Builder module is disabled
    if (!loadingModules && moduleStates['career-builder'] && !moduleStates['career-builder'].publicEnabled) {
        return (
            <PublicLayout>
                <div className="relative overflow-hidden bg-black select-none text-white min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md mx-auto px-4">
                        <div className="w-20 h-20 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center mx-auto">
                            <Lock className="w-10 h-10 text-[#FF6A00]" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Module Unavailable</h1>
                        <p className="text-gray-400">The Career Builder module is currently disabled. Please check back later or contact the administrator.</p>
                        <Link href="/" className="phoenix-button inline-flex">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black select-none text-white min-h-screen">
                {/* Background Grid Lines & glows */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,122,0,0.08),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,122,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,122,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-8 pb-20">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-12 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <Link href="/" className="hover:text-[#FF8A33] transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[#FF7A00]">Career Builder</span>
                    </nav>

                    {/* 1. Hero Section */}
                    <section className="text-center py-16 md:py-24 max-w-4xl mx-auto space-y-8 animate-fade-in-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] tracking-wider uppercase">
                            <Briefcase className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>PhoenixAI Suite Extension</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight font-heading leading-none">
                            Career <span className="gradient-text">Builder</span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Everything you need to build your professional career in one place. Scale your digital footprint and create high-performing resumes.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link
                                href="#services"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5 cursor-pointer animate-pulse-slow"
                            >
                                <span>Explore Services</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                    {/* 2. Statistics Section */}
                    <section className="py-12 border-y border-white/[0.06] my-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {statsLoading ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="phoenix-card p-6 flex flex-col items-center justify-center relative overflow-hidden group border border-white/[0.04]">
                                        <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
                                        <div className="w-24 h-3 bg-white/5 rounded mt-3 animate-pulse" />
                                    </div>
                                ))
                            ) : (
                                displayStats.map((stat, idx) => {
                                    const showPlaceholder = !stat.hasData;
                                    return (
                                        <div key={idx} className="phoenix-card p-6 flex flex-col items-center justify-center relative overflow-hidden group border border-white/[0.04]">
                                            {/* Ambient card glows */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-[#FF7A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading group-hover:scale-105 transition-transform duration-300">
                                                {showPlaceholder ? (
                                                    '—'
                                                ) : stat.isFloat ? (
                                                    <CountUpFloat end={stat.value} suffix={stat.suffix} />
                                                ) : (
                                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                                )}
                                            </span>
                                            
                                            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-2">
                                                {stat.label}
                                            </span>
                                            
                                            {showPlaceholder && (
                                                <span className="text-[9px] text-zinc-600 font-medium mt-1">
                                                    No production data available
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* 3. Services Grid */}
                    <section id="services" className="py-16 space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
                                Integrated <span className="gradient-text">Services</span>
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Optimize your job applications with our suite of modern AI-assisted career tools.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((svc, idx) => (
                                <Link 
                                    key={idx} 
                                    href={svc.href}
                                    className="phoenix-card p-8 flex flex-col justify-between items-start space-y-6 relative group border border-white/[0.04] hover:border-[#FF7A00]/30 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(255,122,0,0.08)] transition-all duration-300 cursor-pointer block"
                                >
                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] group-hover:scale-110 transition-transform duration-300">
                                                <svc.icon className="w-6 h-6 text-[#FF7A00]" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white tracking-wide group-hover:text-[#FF8A33] transition-colors duration-300">
                                            {svc.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {svc.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* 4. How It Works Section */}
                    <section className="py-16 space-y-12 my-12 relative">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
                                How It <span className="gradient-text">Works</span>
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Transition from build to deployment in four simple visual steps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
                            {steps.map((st, idx) => (
                                <div key={idx} className="phoenix-card p-6 flex flex-col items-center text-center space-y-4 border border-white/[0.04] relative group">
                                    <div className="absolute top-4 right-4 text-xs font-bold text-white/10 group-hover:text-[#FF7A00]/20 transition-colors duration-300 font-heading">
                                        {st.step}
                                    </div>
                                    <div className="p-3.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/15 flex items-center justify-center">
                                        <st.icon className="w-5 h-5 text-[#FF7A00]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {st.title}
                                    </h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        {st.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5. Why Choose PhoenixAI */}
                    <section id="why-choose-us" className="py-16 space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
                                Why Choose <span className="gradient-text">PhoenixAI</span>
                            </h2>
                            <p className="text-sm text-zinc-400">
                                We combine standard layout rules with advanced generative systems for top-tier result validation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feat, idx) => (
                                <div key={idx} className="phoenix-card p-6 flex items-start gap-4 border border-white/[0.04] hover:border-[#FF7A00]/30 transition-colors duration-300">
                                    <div className="p-2.5 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] shrink-0">
                                        <feat.icon className="w-5 h-5 text-[#FF7A00]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-md font-semibold text-white tracking-wide">
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
 
                    {/* 6. Redesigned Premium SaaS CTA Section */}
                    <section className="py-20 relative overflow-hidden">
                        {/* Custom Scoped CSS Styles for floating animations */}
                        <style>{`
                            @keyframes float-cta-1 {
                                0%, 100% { transform: translateY(0px) rotate(2deg) scale(1); }
                                50% { transform: translateY(-8px) rotate(1.5deg) scale(1.01); }
                            }
                            @keyframes float-cta-2 {
                                0%, 100% { transform: translateY(0px) rotate(-3deg) scale(1); }
                                50% { transform: translateY(8px) rotate(-2deg) scale(0.99); }
                            }
                            @keyframes float-cta-3 {
                                0%, 100% { transform: translateY(0px) translate(0px); }
                                50% { transform: translateY(-12px) translate(6px); }
                            }
                            .animate-float-card-1 {
                                animation: float-cta-1 6s ease-in-out infinite;
                            }
                            .animate-float-card-2 {
                                animation: float-cta-2 8s ease-in-out infinite;
                            }
                            .animate-float-badge {
                                animation: float-cta-3 5s ease-in-out infinite;
                            }
                        `}</style>

                        {/* Background Container */}
                        <div className="absolute inset-0 z-0 rounded-[32px] overflow-hidden bg-black border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
                            {/* Tiny Grid background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,106,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,106,0,0.015)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
                            {/* Radial glows */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7A00]/5 rounded-full blur-[120px] pointer-events-none" />
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6A00]/5 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-[100px] pointer-events-none" />
                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[1px]" />
                        </div>

                        {/* Content Grid */}
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-6 py-12 sm:p-16">
                            
                            {/* LEFT COLUMN */}
                            <div className="lg:col-span-7 space-y-8 text-left">
                                {/* Small Badge */}
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-xs font-semibold text-[#FF8A33] tracking-wide uppercase">
                                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                                    <span>🚀 Career Builder</span>
                                </div>

                                {/* Heading */}
                                <div className="space-y-4">
                                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight text-white">
                                        Build Your Dream Career <br />
                                        <span className="gradient-text">with AI Powered Tools</span>
                                    </h2>
                                    <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-xl">
                                        Create ATS Optimized Resumes, Modern Portfolio Websites, Professional Cover Letters, LinkedIn Ready Profiles using Enterprise AI.
                                    </p>
                                </div>

                                {/* Feature Chips */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        'ATS Friendly',
                                        '100+ Premium Templates',
                                        'AI Generated',
                                        'HR Approved',
                                        'Portfolio Website',
                                        'Instant PDF Export'
                                    ].map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Check className="w-2.5 h-2.5" />
                                            </div>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                                    {[
                                        { val: '100+', label: 'Templates' },
                                        { val: '95%', label: 'ATS Success' },
                                        { val: '5000+', label: 'Resumes Built' },
                                        { val: '24/7', label: 'AI Assistance' }
                                    ].map((st, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-xl font-bold text-white font-heading">{st.val}</p>
                                            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{st.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex pt-2">
                                    <Link
                                        href="/packages?category=Career Builder"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                                    >
                                        <span>View Packages</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Layered Floating UI Illustration */}
                            <div className="lg:col-span-5 relative w-full h-[380px] flex items-center justify-center">
                                {/* Glow circle backdrop */}
                                <div className="absolute w-64 h-64 bg-[#FF7A00]/8 rounded-full blur-3xl pointer-events-none animate-pulse" />

                                {/* 1. Portfolio Website Mockup Card */}
                                <div className="absolute w-[240px] aspect-[4/3] rounded-xl border border-white/10 bg-black/85 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 space-y-2 -translate-x-12 -translate-y-6 -rotate-3 hover:-rotate-1 transition-all duration-500 animate-float-card-2">
                                    {/* Mock Browser Header */}
                                    <div className="flex items-center gap-1 border-b border-white/5 pb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <div className="h-2 w-20 bg-white/5 rounded mx-auto" />
                                    </div>
                                    {/* Portfolio layout preview items */}
                                    <div className="space-y-1.5 pt-1 text-left">
                                        <div className="h-2.5 w-16 bg-[#FF8A33]/20 rounded" />
                                        <div className="h-1.5 w-24 bg-white/20 rounded" />
                                        <div className="grid grid-cols-2 gap-1 pt-1.5">
                                            <div className="h-10 rounded border border-white/5 bg-white/[0.01]" />
                                            <div className="h-10 rounded border border-white/5 bg-white/[0.01]" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Large Resume Preview Card */}
                                <div className="absolute w-[210px] aspect-[1/1.3] rounded-xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.8)] p-4.5 space-y-3.5 translate-x-12 translate-y-6 rotate-2 hover:rotate-0 transition-all duration-500 animate-float-card-1">
                                    {/* Resume items mock */}
                                    <div className="text-center pb-2 border-b border-white/5 space-y-1">
                                        <div className="h-2 w-14 bg-white/60 mx-auto rounded" />
                                        <div className="h-1.5 w-20 bg-[#FF8A33]/50 mx-auto rounded" />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <div className="h-1.5 w-10 bg-white/30 rounded" />
                                        <div className="h-1 w-full bg-white/10 rounded" />
                                        <div className="h-1 w-full bg-white/10 rounded" />
                                        <div className="h-1 w-2/3 bg-white/10 rounded" />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <div className="h-1.5 w-12 bg-white/30 rounded" />
                                        <div className="h-1 w-full bg-white/10 rounded" />
                                        <div className="h-1 w-5/6 bg-white/10 rounded" />
                                    </div>
                                </div>

                                {/* 3. ATS Score Circular Floater */}
                                <div className="absolute w-22 h-22 rounded-2xl border border-white/10 bg-[#0e0e0e]/95 shadow-2xl p-2.5 flex flex-col items-center justify-center space-y-1.5 -translate-y-24 translate-x-24 animate-float-badge">
                                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#FF7A00] flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">92%</span>
                                    </div>
                                    <span className="text-[7px] text-[#FF8A33] font-bold uppercase tracking-wider block">ATS Score</span>
                                </div>

                                {/* 4. AI Verified Badge */}
                                <div className="absolute px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg translate-y-28 -translate-x-24 animate-float-badge" style={{ animationDelay: '1.5s' }}>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>AI Verified</span>
                                </div>

                                {/* 5. PDF Export Badge */}
                                <div className="absolute px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg -translate-y-28 -translate-x-24 animate-float-badge" style={{ animationDelay: '0.8s' }}>
                                    <FileDown className="w-3.5 h-3.5 text-red-500" />
                                    <span>PDF Export</span>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM TRUST ROW */}
                        <div className="relative z-10 mt-8 pt-8 border-t border-white/5 px-6">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                <span>Trusted by</span>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        'Students',
                                        'Freshers',
                                        'Developers',
                                        'Designers',
                                        'Job Seekers',
                                        'Freelancers'
                                    ].map((pill, idx) => (
                                        <span 
                                            key={idx} 
                                            className="px-3.5 py-1 rounded-full border border-white/[0.04] bg-white/[0.01] hover:border-[#FF7A00]/20 hover:text-white transition-colors duration-300 text-[10px] text-zinc-400 font-bold"
                                        >
                                            {pill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
}
