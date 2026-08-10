'use client';

import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { 
    ChevronRight, 
    Sparkles, 
    ArrowRight, 
    Cpu,
    CheckCircle2,
    MessageSquare,
    Zap,
    RefreshCw
} from 'lucide-react';

export default function AIResumeReviewLandingPage() {
    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black text-white min-h-screen">
                {/* Ambient lights */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,122,0,0.06),transparent_50%)]" />
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
                        <span className="text-[#FF7A00]">AI Resume Review</span>
                    </nav>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
                        {/* Left Info Column */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-xs font-medium text-[#FF8A33] uppercase tracking-wider">
                                <Cpu className="w-3.5 h-3.5 text-[#FF7A00]" />
                                <span>Real-time AI Auditor</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
                                Audit Your Resume With <br />
                                <span className="gradient-text">Advanced LLM Critics</span>
                            </h1>
                            
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Bypass recruiter scrutiny with instant feedback loops. Our specialized AI reviewer evaluates sentence structures, action verb highlights, and details presentations, giving suggestions to boost clarity and professionalism.
                            </p>

                            <div className="space-y-4 pt-2">
                                {[
                                    'Identify weak verbs and replace them with high-impact industry descriptors',
                                    'Detect bullet points that lack quantifiable achievements or metric measures',
                                    'Check section structure against modern HR hiring guidelines'
                                ].map((bullet, idx) => (
                                    <div key={idx} className="flex gap-3 items-start text-xs text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                                        <span>{bullet}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/packages?category=Career Builder"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5"
                                >
                                    <span>View Packages</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right Preview Column (Feedback boxes mockup) */}
                        <div className="relative p-0.5 rounded-[24px] bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-center p-8 min-h-[400px]">
                            {/* Ambient light */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.03),transparent_50%)]" />
                            
                            <div className="relative space-y-4 w-full">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">AI Audit Feedbacks</h4>
                                
                                {/* Feed item 1 */}
                                <div className="p-4 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/20 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-[#FF8A33] uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Verb Highlight</span>
                                        <span>Action Required</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        &quot;Led a team of developers&quot; is passive. We recommend changing it to <span className="text-white font-semibold">&quot;Coordinated sprint cycles for 6 cross-functional developers&quot;</span> to spotlight management depth.
                                    </p>
                                </div>

                                {/* Feed item 2 */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Metrics Verified</span>
                                        <span>Optimal</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Great work specifying &quot;30% performance boost&quot;. Quantifying achievements helps recruiters evaluate immediate business returns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
