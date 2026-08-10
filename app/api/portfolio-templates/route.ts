import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'prisma', 'portfolio_templates.json');

const INITIAL_TEMPLATES = [
    {
        id: 'tpl-glassmorphic-grid',
        name: 'Glassmorphic Grid',
        industry: 'Technology',
        pricing: 'Free' as const,
        status: 'Active' as const,
        visibility: 'Public' as const,
        updated: '2026-07-12',
        desc: 'Next-gen glassmorphic layout with custom interactive project cards.',
        views: 2400,
        created: '2026-07-01',
        color: 'from-orange-600 to-zinc-950',
        portfolioService: 'Developer Portfolio',
        packages: ['Starter', 'Professional'],
        thumbnail: null,
        sourceTemplate: '/templates/glassmorphic_grid.html',
        livePreviews: ['Hero', 'Projects', 'Skills', 'Contact'],
        features: ['Glassmorphism', 'Micro-Animations', 'Project Carousel']
    },
    {
        id: 'tpl-neon-cyber',
        name: 'Neon Cyber',
        industry: 'Creative',
        pricing: 'Premium' as const,
        status: 'Active' as const,
        visibility: 'Public' as const,
        updated: '2026-07-11',
        desc: 'Vibrant orange cyber-grid style theme for digital artists and gamers.',
        views: 1850,
        created: '2026-07-03',
        color: 'from-amber-600 to-zinc-950',
        portfolioService: 'Creative Portfolio',
        packages: ['Professional', 'Enterprise'],
        thumbnail: null,
        sourceTemplate: '/templates/neon_cyber.html',
        livePreviews: ['Hero', 'Showcase Grid', 'About Me', 'Console Terminal'],
        features: ['Custom Cyber Grid', 'Framer Motion Animates', 'Behance Feed Integrated']
    }
];

function readTemplatesFromFile() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
            fs.writeFileSync(FILE_PATH, JSON.stringify(INITIAL_TEMPLATES, null, 2), 'utf-8');
            return INITIAL_TEMPLATES;
        }
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading portfolio templates file:', e);
        return INITIAL_TEMPLATES;
    }
}

function writeTemplatesToFile(templates: any[]) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error writing portfolio templates file:', e);
    }
}

export async function GET() {
    const templates = readTemplatesFromFile();
    return NextResponse.json({ success: true, templates });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const templates = readTemplatesFromFile();

        const newTemplate = {
            id: body.id || `TPL-PORT-${Math.floor(1000 + Math.random() * 9000)}`,
            name: body.name || 'Custom Portfolio Template',
            industry: body.industry || 'Technology',
            pricing: body.pricing || 'Free',
            status: body.status || 'Draft',
            visibility: body.visibility || 'Public',
            updated: new Date().toISOString().split('T')[0],
            desc: body.desc || 'Custom uploaded portfolio template.',
            views: 0,
            created: new Date().toISOString().split('T')[0],
            color: body.color || 'from-orange-600 to-zinc-950',
            portfolioService: body.portfolioService || 'Developer Portfolio',
            packages: body.packages || ['Starter'],
            thumbnail: body.thumbnail || null,
            sourceTemplate: body.sourceTemplate || null,
            livePreviews: body.livePreviews || ['Hero', 'Projects', 'Skills'],
            features: body.features || ['Custom Layout']
        };

        // Write to database using Prisma
        try {
            await prisma.portfolioTemplate.upsert({
                where: { id: newTemplate.id },
                update: {},
                create: { 
                    id: newTemplate.id, 
                    name: newTemplate.name, 
                    htmlContent: newTemplate.desc || '',
                    category: 'portfolio'
                } as any
            });
        } catch (dbErr) {
            console.error('Database update failed in portfolio templates:', dbErr);
        }

        templates.unshift(newTemplate);
        writeTemplatesToFile(templates);

        return NextResponse.json({ success: true, template: newTemplate });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
        }

        // Delete from database
        try {
            await prisma.portfolioTemplate.delete({
                where: { id: id }
            });
        } catch (dbErr) {
            // Ignore if not in db
        }

        const templates = readTemplatesFromFile();
        const filtered = templates.filter((t: any) => t.id !== id);
        writeTemplatesToFile(filtered);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
