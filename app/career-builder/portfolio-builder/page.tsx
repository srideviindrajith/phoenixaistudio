'use client';

import { useEffect } from 'react';

export default function PortfolioBuilderRedirect() {
    useEffect(() => {
        window.location.replace('/career-builder/portfolio');
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
            <span className="text-sm font-semibold tracking-wider animate-pulse">Redirecting...</span>
        </div>
    );
}
