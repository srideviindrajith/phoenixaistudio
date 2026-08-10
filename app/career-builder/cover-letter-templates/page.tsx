'use client';

import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
    ChevronRight, 
    Sparkles, 
    Search,
    BookOpen,
    CheckCircle2,
    Lock
} from 'lucide-react';

interface CoverLetterTemplateItem {
    id: string;
    name: string;
    industry: string;
    theme: string;
    templateType: string;
    experienceLevel: string;
    language: string;
    status: 'Active' | 'Draft' | 'Archived';
    visibility: 'Public' | 'Internal Only';
    featured: boolean;
    premium: boolean;
    desc: string;
    previewImage: string | null;
    sourceTemplate: string | null;
    samplePdf: string | null;
    sampleDocx: string | null;
    sampleHtml: string | null;
    sampleJson: string | null;
    atsFriendly: boolean;
    created: string;
    updated: string;
}

export default function CoverLetterTemplatesPublicPage() {
    const [templates, setTemplates] = useState<CoverLetterTemplateItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('All');
    const [themeFilter, setThemeFilter] = useState('All');
    const [expFilter, setExpFilter] = useState('All');

    useEffect(() => {
        const loadTemplates = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/cover-letter-templates');
                const data = await res.json();
                if (data.success) {
                    // Display ONLY Published, Public, Active records
                    const publicActive = (data.templates || []).filter(
                        (t: CoverLetterTemplateItem) => t.status === 'Active' && t.visibility === 'Public'
                    );
                    setTemplates(publicActive);
                }
            } catch (err) {
                console.error('Error fetching cover letter templates:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTemplates();
    }, []);

    // Get unique values for filters
    const uniqueIndustries = ['All', ...Array.from(new Set(templates.map(t => t.industry)))];
    const uniqueThemes = ['All', ...Array.from(new Set(templates.map(t => t.theme)))];
    const uniqueExperiences = ['All', ...Array.from(new Set(templates.map(t => t.experienceLevel)))];

    // Filter templates
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = industryFilter === 'All' || t.industry === industryFilter;
        const matchesTheme = themeFilter === 'All' || t.theme === themeFilter;
        const matchesExp = expFilter === 'All' || t.experienceLevel === expFilter;

        return matchesSearch && matchesIndustry && matchesTheme && matchesExp;
    });

    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black select-none text-white min-h-screen">
                {/* Ambient lights */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,122,0,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(255,106,0,0.03),transparent_40%)]" />
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
                        <span className="text-[#FF7A00]">Cover Letter Templates</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="text-center py-16 md:py-20 max-w-3xl mx-auto space-y-6 animate-fade-in-scale">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] tracking-wider uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>Recruiter Approved Layouts</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-none">
                            Cover Letter <span className="gradient-text">Templates</span>
                        </h1>
                        <p className="text-md sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Stand out with a professional, structured cover letter layout. Download matching structures tailored for applicant tracking systems.
                        </p>
                    </section>

                    {/* Search & Filters Toolbar */}
                    <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-md space-y-4 mb-10">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search layouts by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.08] bg-black text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00]/50"
                                />
                            </div>
                            
                            {/* Filters */}
                            <div className="grid grid-cols-3 gap-3 min-w-[320px] md:min-w-[450px]">
                                <select 
                                    value={industryFilter}
                                    onChange={(e) => setIndustryFilter(e.target.value)}
                                    className="h-11 px-3 rounded-xl border border-white/[0.08] bg-black text-[10px] text-zinc-400 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Industries</option>
                                    {uniqueIndustries.filter(ind => ind !== 'All').map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>

                                <select 
                                    value={themeFilter}
                                    onChange={(e) => setThemeFilter(e.target.value)}
                                    className="h-11 px-3 rounded-xl border border-white/[0.08] bg-black text-[10px] text-zinc-400 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Themes</option>
                                    {uniqueThemes.filter(th => th !== 'All').map(th => (
                                        <option key={th} value={th}>{th}</option>
                                    ))}
                                </select>

                                <select 
                                    value={expFilter}
                                    onChange={(e) => setExpFilter(e.target.value)}
                                    className="h-11 px-3 rounded-xl border border-white/[0.08] bg-black text-[10px] text-zinc-400 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Levels</option>
                                    {uniqueExperiences.filter(lvl => lvl !== 'All').map(lvl => (
                                        <option key={lvl} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Templates Grid / Catalog */}
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-zinc-500 text-xs">Loading template catalog...</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="p-16 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center text-zinc-500 text-xs max-w-lg mx-auto">
                            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                            No cover letter templates found matching your search.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {filteredTemplates.map((row) => (
                                <div key={row.id} className="phoenix-card p-6 flex flex-col justify-between items-start space-y-6 relative border border-white/[0.04] hover:border-[#FF7A00]/20 transition-all duration-300">
                                    <div className="space-y-4 w-full">
                                        
                                        {/* Visual Thumbnail Simulator */}
                                        <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/[0.08] relative overflow-hidden flex flex-col p-4 justify-between group shadow-inner">
                                            {row.previewImage ? (
                                                <img src={row.previewImage} alt={row.name} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                                        </div>
                                                        {row.premium && (
                                                            <span className="text-[7px] bg-[#FF7A00]/10 text-[#FF8A33] border border-[#FF7A00]/20 font-bold px-1 rounded flex items-center gap-0.5">
                                                                <Lock className="w-2 h-2" /> PREMIUM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 text-left">
                                                        <div className="w-16 h-2 bg-[#FF7A00]/15 rounded" />
                                                        <div className="w-24 h-3 bg-white/10 rounded" />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-start pt-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-white tracking-wide">{row.name}</h3>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">{row.industry} • {row.theme}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 min-h-[48px]">
                                            {row.desc}
                                        </p>

                                        {/* Details Badges */}
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
                                            {row.atsFriendly && (
                                                <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-1.5 py-0.5 rounded tracking-wider">
                                                    ATS COMPLIANT
                                                </span>
                                            )}
                                            <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold px-1.5 py-0.5 rounded tracking-wider">
                                                {row.experienceLevel.toUpperCase()}
                                            </span>
                                            <span className="text-[8px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-bold px-1.5 py-0.5 rounded tracking-wider">
                                                {row.language.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Link to Packages */}
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
                </div>
            </div>
        </PublicLayout>
    );
}
