'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ArrowRight, Globe } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function LogoutPage() {
    const router = useRouter();

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-transparent select-none">
            {/* Shifting orange glows to overlay on top of standard background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#FF7A00]/5 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF6A00]/5 rounded-full blur-[120px] animate-pulse-slower"></div>
            </div>

            {/* Card Container with orange ambient glow */}
            <div className="relative w-full max-w-[480px] z-10 animate-fade-in-scale p-0.5">
                {/* Dashboard-style orange ambient glow behind widget */}
                <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] opacity-10 blur-lg"></div>
                <div className="absolute -inset-3 rounded-[28px] bg-[#FF7A00]/10 opacity-20 blur-xl animate-float-glow"></div>

                {/* The glassmorphic card widget matching Dashboard */}
                <div className="relative w-full rounded-[20px] bg-[#0c0c0c]/95 border border-[#FF7A00]/25 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(255,122,0,0.12)] text-center space-y-6">
                    {/* Branding */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FF7A00]/10 to-[#FF9F1A]/5 border border-[#FF7A00]/20 shadow-[0_0_20px_rgba(255,106,0,0.15)] transition-transform duration-300 hover:scale-105 relative group">
                            {/* Glow effect wrapper around logo */}
                            <div className="absolute inset-0 rounded-2xl bg-[#FF7A00]/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <BrandLogo size="medium" glow={true} showTextFallback={true} className="relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-heading text-white drop-shadow-[0_0_15px_rgba(255,122,0,0.4)]">
                                PhoenixAI Studio
                            </h1>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF7A00] mt-1.5">
                                SECURE ADMIN PORTAL
                            </p>
                        </div>
                    </div>

                    {/* Logout Icon & Text */}
                    <div className="flex flex-col items-center space-y-3 py-4">
                        <div className="w-16 h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center shadow-[0_0_24px_rgba(255,122,0,0.15)] relative">
                            {/* Orange pulse effect behind icon */}
                            <span className="absolute inset-0 rounded-full bg-[#FF7A00]/20 animate-ping opacity-30"></span>
                            <LogOut className="w-7 h-7 text-[#FF7A00] relative z-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-white tracking-wide">
                                You have been logged out
                            </h2>
                            <p className="text-sm text-zinc-400 max-w-[280px] mx-auto">
                                Your admin console session has been securely ended.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => router.push('/admin/login')}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] h-12 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 tracking-wide font-heading focus:outline-none"
                        >
                            <span>Login Again</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] hover:border-[#FF7A00]/30 bg-[#161616]/60 hover:bg-[#1f1f1f] h-12 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,106,0,0.1)] hover:-translate-y-0.5 active:translate-y-0 tracking-wide font-heading focus:outline-none"
                        >
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span>Return to Website</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/[0.06] text-center">
                        <p className="text-[10px] text-zinc-600 font-medium">
                            © PhoenixAI Studio
                        </p>
                    </div>
                </div>
            </div>

            {/* Inline styles for animations */}
            <style jsx>{`
                @keyframes float-glow {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-8px) scale(1.02); }
                }
                .animate-float-glow {
                    animation: float-glow 8s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 12s ease-in-out infinite;
                }
                @keyframes pulse-slower {
                    0%, 100% { opacity: 0.2; transform: scale(1.05); }
                    50% { opacity: 0.4; transform: scale(0.95); }
                }
                .animate-pulse-slower {
                    animation: pulse-slower 16s ease-in-out infinite alternate;
                }
                @keyframes fade-in-scale {
                    from {
                        opacity: 0;
                        transform: scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
