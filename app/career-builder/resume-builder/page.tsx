'use client';

import { useEffect } from 'react';

export default function ResumeBuilderRedirect() {
    useEffect(() => {
        window.location.replace('/career-builder/resume');
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
            <span className="text-sm font-semibold tracking-wider animate-pulse">Redirecting...</span>
        </div>
    );
}
