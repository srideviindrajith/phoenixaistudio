'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to process request.');
                return;
            }

            setSuccessMessage(data.message || 'If the email exists, a password reset link has been sent.');
            setEmail('');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

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
                <div className="relative w-full rounded-[20px] bg-[#0c0c0c]/95 border border-[#FF7A00]/25 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(255,122,0,0.12)] space-y-6">
                    {/* Branding */}
                    <div className="flex flex-col items-center text-center space-y-3">
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

                    {/* Header info */}
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white tracking-wide">
                            Forgot Password
                        </h2>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-[340px] mx-auto">
                            Enter your registered email address below, and we will dispatch a secure one-time password reset link.
                        </p>
                    </div>

                    {successMessage ? (
                        /* Success Panel */
                        <div className="space-y-6 animate-fade-in-scale">
                            <div className="rounded-[14px] bg-emerald-950/40 border border-emerald-500/20 p-4 text-center text-xs text-emerald-400 flex flex-col items-center justify-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <p className="font-medium">{successMessage}</p>
                            </div>
                            <Link
                                href="/admin/login"
                                className="w-full h-12 rounded-[14px] border border-white/[0.08] hover:border-[#FF7A00]/30 bg-[#161616]/60 hover:bg-[#1f1f1f] text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,106,0,0.1)] flex items-center justify-center gap-2 focus:outline-none"
                            >
                                <ArrowLeft className="w-4 h-4 text-zinc-400" />
                                <span>Return to Login</span>
                            </Link>
                        </div>
                    ) : (
                        /* Reset Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-wider text-zinc-400" htmlFor="email-input">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#FF7A00] transition-colors group-focus-within:text-[#FF8A33]" />
                                    </div>
                                    <input
                                        id="email-input"
                                        type="email"
                                        required
                                        placeholder="admin@phoenixai.studio"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 rounded-[14px] bg-[#050505]/95 border border-white/[0.08] pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00]/80 focus:ring-4 focus:ring-[#FF7A00]/10 transition-all duration-300 hover:border-white/[0.15]"
                                        aria-label="Email Address"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-[14px] bg-red-955/40 border border-red-500/20 p-3 text-center text-xs text-red-400 flex items-center justify-center gap-2 animate-shake">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-550"></span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full h-12 rounded-[14px] bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#FF7A00]/20 flex items-center justify-center gap-2 overflow-hidden group tracking-wide font-heading"
                                >
                                    {/* Shine effect */}
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

                                    {loading ? (
                                        <svg
                                            className="h-5 w-5 animate-spin text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                            />
                                        </svg>
                                    ) : (
                                        <span>Send Reset Instructions</span>
                                    )}
                                </button>

                                <Link
                                    href="/admin/login"
                                    className="w-full h-12 rounded-[14px] border border-white/[0.08] hover:border-[#FF7A00]/30 bg-[#161616]/60 hover:bg-[#1f1f1f] text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,106,0,0.1)] flex items-center justify-center gap-2 focus:outline-none"
                                >
                                    <ArrowLeft className="w-4 h-4 text-zinc-400" />
                                    <span>Return to Login</span>
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/[0.06] text-center space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            <Lock className="w-3.5 h-3.5 text-[#FF7A00]" />
                            <span>ADMIN ACCESS ONLY</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[320px] mx-auto">
                            Only authorized administrators can access PhoenixAI Studio.
                        </p>
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
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 2;
                }
            `}</style>
        </div>
    );
}
